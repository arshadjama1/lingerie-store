/* eslint-disable no-console */
import dotenv from "dotenv";
import postgres from "postgres";

dotenv.config({ path: ".env" });

const databaseUrl =
  process.env.DATABASE_DIRECT_URL || process.env.DATABASE_URL!;

const sql = postgres(databaseUrl, { max: 1 });

async function main() {
  console.log("Applying handle_new_user function and trigger...");

  await sql`
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO public.profiles (id, email, phone, role)
      VALUES (
        new.id,
        new.email,
        new.phone,
        'customer'
      )
      ON CONFLICT (id) DO UPDATE SET
        email = COALESCE(public.profiles.email, EXCLUDED.email),
        phone = COALESCE(public.profiles.phone, EXCLUDED.phone);
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;

  await sql`
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  `;

  await sql`
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  `;

  console.log("Verifying trigger creation...");
  const triggers = await sql`
    SELECT trigger_name, event_manipulation, event_object_table
    FROM information_schema.triggers
    WHERE event_object_schema = 'auth' AND event_object_table = 'users';
  `;
  console.log("Triggers on auth.users:", triggers);

  await sql.end();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
