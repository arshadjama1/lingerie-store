-- ── 0006_enhanced_search_vector.sql ─────────────────────────────────
-- Enhances products search vector with weighted attributes:
-- Weight A: Product Name (Primary title relevance)
-- Weight B: Category Path, Category Name, Domain Synonyms (bra/bras, panty/panties/undies), Tags
-- Weight C: Variant Colors, Description

CREATE OR REPLACE FUNCTION generate_lingerie_synonyms(txt text)
RETURNS text LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  lower_txt text := lower(COALESCE(txt, ''));
  synonyms text := '';
BEGIN
  -- Bra / Bras pluralization & variants
  IF lower_txt ~* '\y(bra|bras|bralette|bralettes)\y' THEN
    synonyms := synonyms || ' bra bras bralette bralettes';
  END IF;

  -- Panty / Panties / Undie / Undies / Briefs / Boyleg / Hipster / Underwear
  IF lower_txt ~* '\y(panty|panties|undie|undies|boyleg|hipster|brief|briefs|underwear)\y' THEN
    synonyms := synonyms || ' panty panties undie undies brief briefs underwear';
  END IF;

  -- Camisole / Camisoles / Cami / Slip / Loungewear
  IF lower_txt ~* '\y(camisole|camisoles|cami|camis|tank|slip|lounge|loungewear)\y' THEN
    synonyms := synonyms || ' camisole camisoles cami loungewear nightwear lounge';
  END IF;

  -- Sets / Combos / Packs / Bundles
  IF lower_txt ~* '\y(set|sets|pack|combo|bundle)\y' THEN
    synonyms := synonyms || ' set sets pack combo bundle lingerie-set';
  END IF;

  RETURN synonyms;
END;
$$;

CREATE OR REPLACE FUNCTION update_product_search_vector()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  variant_colors text;
  category_name text;
  all_synonyms text;
BEGIN
  -- Gather unique variant colors
  SELECT COALESCE(string_agg(DISTINCT color, ' '), '')
  INTO variant_colors
  FROM product_variants
  WHERE product_id = NEW.id AND is_active = true;

  -- Gather category name from categories table
  SELECT COALESCE(name, '')
  INTO category_name
  FROM categories
  WHERE id = NEW.category_id;

  -- Build domain-specific lingerie synonyms
  all_synonyms := generate_lingerie_synonyms(
    COALESCE(NEW.name, '') || ' ' || 
    COALESCE(NEW.category_path, '') || ' ' || 
    category_name || ' ' || 
    COALESCE(array_to_string(NEW.tags, ' '), '')
  );

  -- Build weighted tsvector:
  -- Weight A: Product Name (Primary title relevance)
  -- Weight B: Category Path, Category Name, Domain Synonyms, Product Tags
  -- Weight C: Variant Colors, Description
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', 
      COALESCE(NEW.category_path, '') || ' ' || 
      category_name || ' ' || 
      COALESCE(array_to_string(NEW.tags, ' '), '') || ' ' || 
      all_synonyms
    ), 'B') ||
    setweight(to_tsvector('english', 
      COALESCE(NEW.description, '') || ' ' || 
      COALESCE(variant_colors, '')
    ), 'C');

  RETURN NEW;
END; $$;

-- Rebuild search_vector on all active products
UPDATE products
SET updated_at = NOW();
