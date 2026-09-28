-- ============================================================
-- 01_schema.sql
-- Skema Database SMP Negeri 18 Buton Tengah untuk Supabase
-- Menangani Fitur Baru: Akun (Siswa/Guru/Admin), Profil, CBT Ulangan,
-- Soal, Hasil Ulangan, Pesan Kontak, dan Pengaturan Sistem.
-- (Data Kelulusan tetap di Google Spreadsheet sesuai aturan utama)
-- ============================================================

-- Aktifkan ekstensi UUID jika belum ada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABEL PROFILES (Ekstensi auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'guru', 'siswa')),
  nama_lengkap TEXT NOT NULL,
  no_hp TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABEL SISWA (Data Induk Siswa Dapodik untuk Portal Siswa)
CREATE TABLE IF NOT EXISTS public.siswa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  nisn VARCHAR(10) UNIQUE NOT NULL,
  nipd VARCHAR(20),
  nik VARCHAR(16),
  nama TEXT NOT NULL,
  kelas VARCHAR(20) NOT NULL DEFAULT 'IX',
  tempat_lahir TEXT,
  tanggal_lahir DATE NOT NULL,
  jk VARCHAR(1) CHECK (jk IN ('L', 'P')),
  agama TEXT DEFAULT 'Islam',
  nama_ayah TEXT,
  nama_ibu TEXT,
  alamat TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABEL GURU (Data Pendidik & Tenaga Kependidikan)
CREATE TABLE IF NOT EXISTS public.guru (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  nip VARCHAR(30),
  nama TEXT NOT NULL,
  mapel_utama TEXT,
  no_hp TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABEL PENGATURAN (Konfigurasi Sekolah & Integrasi)
CREATE TABLE IF NOT EXISTS public.pengaturan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  label TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABEL ULANGAN / UJIAN ONLINE (CBT)
CREATE TABLE IF NOT EXISTS public.ulangan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  judul TEXT NOT NULL,
  deskripsi TEXT,
  mapel TEXT NOT NULL,
  kelas VARCHAR(20) NOT NULL,
  durasi_menit INTEGER NOT NULL DEFAULT 60,
  waktu_mulai TIMESTAMPTZ,
  waktu_selesai TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  tipe_ujian VARCHAR(20) DEFAULT 'manual', -- 'manual' (CBT butir) atau 'pdf' (naskah PDF + LJK)
  file_pdf_url TEXT,
  file_pdf_nama TEXT,
  file_pdf_size TEXT,
  total_soal_pdf INTEGER DEFAULT 0,
  opsi_jawaban VARCHAR(5) DEFAULT 'ABCD',
  kunci_jawaban_pdf JSONB DEFAULT '{}'::jsonb,
  bobot_per_soal INTEGER DEFAULT 10,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABEL SOAL ULANGAN (Bank Soal Pilihan Ganda)
CREATE TABLE IF NOT EXISTS public.soal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ulangan_id UUID NOT NULL REFERENCES public.ulangan(id) ON DELETE CASCADE,
  urutan INTEGER NOT NULL DEFAULT 1,
  pertanyaan TEXT NOT NULL,
  pilihan_a TEXT NOT NULL,
  pilihan_b TEXT NOT NULL,
  pilihan_c TEXT NOT NULL,
  pilihan_d TEXT NOT NULL,
  kunci_jawaban VARCHAR(1) NOT NULL CHECK (kunci_jawaban IN ('A', 'B', 'C', 'D')),
  bobot INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABEL HASIL ULANGAN (Jawaban & Skor Siswa)
CREATE TABLE IF NOT EXISTS public.hasil_ulangan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ulangan_id UUID NOT NULL REFERENCES public.ulangan(id) ON DELETE CASCADE,
  siswa_id UUID REFERENCES public.siswa(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  nilai NUMERIC(5,2) NOT NULL DEFAULT 0,
  total_benar INTEGER NOT NULL DEFAULT 0,
  total_salah INTEGER NOT NULL DEFAULT 0,
  jawaban_siswa JSONB NOT NULL DEFAULT '{}'::jsonb,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TABEL PESAN KONTAK (Kotak Masuk Saran/Pesan dari Website Publik)
CREATE TABLE IF NOT EXISTS public.pesan_kontak (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  email TEXT NOT NULL,
  no_hp TEXT,
  subjek TEXT NOT NULL,
  pesan TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES UNTUK PERFORMA QUERY
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_siswa_nisn ON public.siswa(nisn);
CREATE INDEX IF NOT EXISTS idx_siswa_kelas ON public.siswa(kelas);
CREATE INDEX IF NOT EXISTS idx_ulangan_kelas ON public.ulangan(kelas);
CREATE INDEX IF NOT EXISTS idx_ulangan_active ON public.ulangan(is_active);
CREATE INDEX IF NOT EXISTS idx_soal_ulangan ON public.soal(ulangan_id);
CREATE INDEX IF NOT EXISTS idx_hasil_ulangan_siswa ON public.hasil_ulangan(siswa_id);
CREATE INDEX IF NOT EXISTS idx_hasil_ulangan_ulangan ON public.hasil_ulangan(ulangan_id);

-- ============================================================
-- TRIGGER OTOMATIS PROFILES DARI AUTH.USERS
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, nama_lengkap)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'siswa'),
    COALESCE(NEW.raw_user_meta_data->>'nama_lengkap', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    nama_lengkap = EXCLUDED.nama_lengkap,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Aktifkan RLS di setiap tabel
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.siswa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guru ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pengaturan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ulangan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hasil_ulangan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pesan_kontak ENABLE ROW LEVEL SECURITY;

-- Helper function cek role admin/guru
CREATE OR REPLACE FUNCTION public.is_admin_or_guru()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'guru')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Profiles: User baca profil sendiri, Admin/Guru baca semua
CREATE POLICY "Profiles: Read access" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin_or_guru());

CREATE POLICY "Profiles: Update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 2. Siswa: Siswa baca profil sendiri, Admin/Guru kelola penuh
CREATE POLICY "Siswa: Read self or admin" ON public.siswa
  FOR SELECT USING (profile_id = auth.uid() OR public.is_admin_or_guru());

CREATE POLICY "Siswa: Admin/Guru manage" ON public.siswa
  FOR ALL USING (public.is_admin_or_guru());

-- 3. Guru: Admin kelola, Guru baca profil sendiri
CREATE POLICY "Guru: Read all" ON public.guru
  FOR SELECT USING (TRUE);

CREATE POLICY "Guru: Admin manage" ON public.guru
  FOR ALL USING (public.is_admin_or_guru());

-- 4. Pengaturan: Publik baca, Admin ubah
CREATE POLICY "Pengaturan: Public read" ON public.pengaturan
  FOR SELECT USING (TRUE);

CREATE POLICY "Pengaturan: Admin manage" ON public.pengaturan
  FOR ALL USING (public.is_admin_or_guru());

-- 5. Ulangan: Siswa baca yang aktif, Admin/Guru kelola penuh
CREATE POLICY "Ulangan: Public read active" ON public.ulangan
  FOR SELECT USING (is_active = TRUE OR public.is_admin_or_guru());

CREATE POLICY "Ulangan: Admin/Guru manage" ON public.ulangan
  FOR ALL USING (public.is_admin_or_guru());

-- 6. Soal: Siswa baca soal ulangan aktif, Admin/Guru kelola penuh
CREATE POLICY "Soal: Siswa read active" ON public.soal
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.ulangan
      WHERE id = soal.ulangan_id AND is_active = TRUE
    ) OR public.is_admin_or_guru()
  );

CREATE POLICY "Soal: Admin/Guru manage" ON public.soal
  FOR ALL USING (public.is_admin_or_guru());

-- 7. Hasil Ulangan: Siswa baca miliknya, Admin/Guru baca semua
CREATE POLICY "Hasil Ulangan: Siswa read own" ON public.hasil_ulangan
  FOR SELECT USING (profile_id = auth.uid() OR public.is_admin_or_guru());

CREATE POLICY "Hasil Ulangan: Siswa submit" ON public.hasil_ulangan
  FOR INSERT WITH CHECK (profile_id = auth.uid() OR public.is_admin_or_guru());

CREATE POLICY "Hasil Ulangan: Admin manage" ON public.hasil_ulangan
  FOR ALL USING (public.is_admin_or_guru());

-- 8. Pesan Kontak: Siapapun (anon) bisa kirim pesan, Admin/Guru baca & hapus
CREATE POLICY "Pesan Kontak: Public insert" ON public.pesan_kontak
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Pesan Kontak: Admin/Guru manage" ON public.pesan_kontak
  FOR ALL USING (public.is_admin_or_guru());
