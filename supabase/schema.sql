-- ============================================================
--  BHT CERTIFY — Schéma complet de la base de données Supabase
--  Fichier idempotent : exécutable plusieurs fois sans erreur.
--  Lancer dans le SQL Editor de Supabase (Dashboard > SQL Editor).
--
--  Crée :
--    1. le type ENUM  attestation_status
--    2. la table      public.attestations
--    3. les index
--    4. le bucket     attestations-files  (+ politiques de stockage)
-- ============================================================

-- ------------------------------------------------------------
-- 1) Type ENUM pour le statut des attestations (idempotent)
-- ------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attestation_status') THEN
        CREATE TYPE public.attestation_status AS ENUM ('draft', 'generated', 'sent', 'error');
    END IF;
END $$;

-- ------------------------------------------------------------
-- 2) Table principale des attestations (idempotent)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.attestations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    -- Informations Émetteur / Directeur
    director_title_name VARCHAR(255) NOT NULL DEFAULT 'M. SAIBOU Aziz',
    company_name VARCHAR(255) NOT NULL DEFAULT 'BENIN HUB TECHNOLOGIES (BHT)',
    company_city VARCHAR(255) NOT NULL DEFAULT 'Abomey-Calavi',

    -- Informations Étudiant
    student_gender VARCHAR(10) NOT NULL DEFAULT 'M.',             -- 'M.' ou 'Mme'
    student_full_name VARCHAR(255) NOT NULL,
    birth_date DATE NOT NULL,
    birth_place VARCHAR(255) NOT NULL,
    school_name VARCHAR(255) NOT NULL,                            -- Ex: LES COURS SONOU (LCS)
    filiere VARCHAR(255) NOT NULL,                                -- Ex: SSRI
    student_email VARCHAR(255) NOT NULL,

    -- Informations Stage
    start_date TEXT NOT NULL,                                     -- Libre : "09 Février"
    end_date TEXT NOT NULL,                                        -- Libre : "18 Avril 2026"
    poles TEXT NOT NULL,                                           -- Ex: Réseau et Cybersécurité

    -- Informations Délivrance
    issue_place VARCHAR(255) NOT NULL DEFAULT 'Abomey-Calavi',
    issue_date DATE NOT NULL,
    signatory_name VARCHAR(255) NOT NULL DEFAULT 'Mr Aziz SAIBOU',
    signatory_role VARCHAR(255) NOT NULL DEFAULT 'Le Directeur Général',

    -- Fichiers générés
    pdf_url TEXT,
    docx_url TEXT,
    status public.attestation_status DEFAULT 'generated' NOT NULL,
    last_sent_at TIMESTAMP WITH TIME ZONE,
    send_error_log TEXT
);

-- Conversion des colonnes de période en TEXTE (idempotent).
-- Nécessaire si la table a été créée avec l'ancien script où start_date/end_date
-- étaient de type DATE : le formulaire envoie des libellés libres ("18 Avril 2026").
ALTER TABLE public.attestations ALTER COLUMN start_date TYPE TEXT;
ALTER TABLE public.attestations ALTER COLUMN end_date TYPE TEXT;

-- ------------------------------------------------------------
-- 3) Index pour recherche et filtrage rapides (idempotent)
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_attestations_student_name ON public.attestations(student_full_name);
CREATE INDEX IF NOT EXISTS idx_attestations_filiere ON public.attestations(filiere);
CREATE INDEX IF NOT EXISTS idx_attestations_status ON public.attestations(status);
CREATE INDEX IF NOT EXISTS idx_attestations_dates ON public.attestations(created_at DESC);

-- ------------------------------------------------------------
-- 4) Bucket de stockage public (idempotent)
-- ------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('attestations-files', 'attestations-files', true)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- 5) Politiques d'accès au bucket (idempotent via DROP)
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Accès public aux fichiers d'attestation" ON storage.objects;
CREATE POLICY "Accès public aux fichiers d'attestation"
ON storage.objects FOR SELECT
USING (bucket_id = 'attestations-files');

DROP POLICY IF EXISTS "Insertion de fichiers autorisée" ON storage.objects;
CREATE POLICY "Insertion de fichiers autorisée"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'attestations-files');

DROP POLICY IF EXISTS "Mise à jour autorisée" ON storage.objects;
CREATE POLICY "Mise à jour autorisée"
ON storage.objects FOR UPDATE
WITH CHECK (bucket_id = 'attestations-files');

DROP POLICY IF EXISTS "Suppression autorisée" ON storage.objects;
CREATE POLICY "Suppression autorisée"
ON storage.objects FOR DELETE
USING (bucket_id = 'attestations-files');

-- ============================================================
-- FIN DU SCRIPT
-- ============================================================