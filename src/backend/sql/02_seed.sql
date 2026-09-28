-- ============================================================
-- 02_seed.sql
-- Data Inisialisasi (Seed) SMP Negeri 18 Buton Tengah
-- ============================================================

-- 1. Pengaturan Default Sekolah
INSERT INTO public.pengaturan (key, value, label)
VALUES
  ('nama_sekolah', 'SMP NEGERI 18 BUTON TENGAH', 'Nama Resmi Sekolah'),
  ('npsn', '69989025', 'Nomor Pokok Sekolah Nasional'),
  ('tahun_ajaran', '2025/2026', 'Tahun Ajaran Aktif'),
  ('alamat', 'Jalan Poros Waburense, Desa Tanailandu, Kec. Mawasangka, Kab. Buton Tengah, Sulawesi Tenggara 93762', 'Alamat Sekolah'),
  ('email_kontak', 'info@smpn18buteng.sch.id', 'Email Resmi'),
  ('telepon_kontak', '0812-3456-7890', 'Nomor Telepon / WhatsApp'),
  ('google_sheet_kelulusan', 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTUVq4l9uDPXQLj8S3BBa0lrRWvNWATwEzjtdhzfJvDMMVfGR5PIODosccCS9KOgYPT9OIm5jPoLSMD/pub?output=csv', 'URL Google Spreadsheet Kelulusan'),
  ('pengumuman_buka', 'true', 'Status Pembukaan Pengumuman Kelulusan')
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value;

-- 2. Data Contoh Guru
INSERT INTO public.guru (nip, nama, mapel_utama, no_hp)
VALUES
  ('197805122008011012', 'Ruslan Saula, S.Pd.', 'Kepala Sekolah / Bahasa Indonesia', '081245678901'),
  ('198502142010012023', 'Siti Rahmawati, S.Pd.', 'Matematika', '082198765432'),
  ('199011032015021004', 'Ahmad Fadillah, S.Pd.', 'Ilmu Pengetahuan Alam (IPA)', '085233445566'),
  ('199208202019032015', 'Nurul Hidayah, S.Pd.', 'Bahasa Inggris', '087811223344')
ON CONFLICT DO NOTHING;

-- 3. Data Contoh Ulangan CBT
DO $$
DECLARE
  v_ulangan_id UUID;
BEGIN
  -- Cek apakah ulangan contoh sudah ada
  SELECT id INTO v_ulangan_id FROM public.ulangan WHERE judul = 'Ulangan Harian Matematika - Pola Bilangan' LIMIT 1;

  IF v_ulangan_id IS NULL THEN
    INSERT INTO public.ulangan (judul, deskripsi, mapel, kelas, durasi_menit, is_active)
    VALUES (
      'Ulangan Harian Matematika - Pola Bilangan',
      'Ujian kompetensi dasar pola bilangan dan barisan aritmatika untuk Kelas IX.',
      'Matematika',
      'IX',
      45,
      TRUE
    )
    RETURNING id INTO v_ulangan_id;

    -- Soal 1
    INSERT INTO public.soal (ulangan_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban, bobot)
    VALUES (
      v_ulangan_id,
      1,
      'Suku ke-10 dari barisan bilangan 3, 7, 11, 15, ... adalah...',
      '35',
      '39',
      '41',
      '43',
      'B',
      20
    );

    -- Soal 2
    INSERT INTO public.soal (ulangan_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban, bobot)
    VALUES (
      v_ulangan_id,
      2,
      'Rumus suku ke-n dari barisan aritmatika 5, 8, 11, 14, ... adalah...',
      'Un = 3n + 2',
      'Un = 3n - 2',
      'Un = 2n + 3',
      'Un = 4n + 1',
      'A',
      20
    );

    -- Soal 3
    INSERT INTO public.soal (ulangan_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban, bobot)
    VALUES (
      v_ulangan_id,
      3,
      'Dua suku berikutnya dari barisan geometri 2, 6, 18, ... berturut-turut adalah...',
      '36 dan 72',
      '54 dan 162',
      '54 dan 108',
      '48 dan 96',
      'B',
      20
    );

    -- Soal 4
    INSERT INTO public.soal (ulangan_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban, bobot)
    VALUES (
      v_ulangan_id,
      4,
      'Jumlah 8 suku pertama dari deret 1 + 3 + 5 + 7 + ... adalah...',
      '49',
      '56',
      '64',
      '81',
      'C',
      20
    );

    -- Soal 5
    INSERT INTO public.soal (ulangan_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban, bobot)
    VALUES (
      v_ulangan_id,
      5,
      'Diketahui barisan aritmatika dengan suku pertama a = 4 dan beda b = 5. Nilai dari suku ke-15 adalah...',
      '74',
      '79',
      '84',
      '89',
      'A',
      20
    );
  END IF;
END $$;
