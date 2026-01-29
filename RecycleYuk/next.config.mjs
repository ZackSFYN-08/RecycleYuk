/** @type {import('next').NextConfig} */
// deno-lint-ignore-file
const nextConfig = {
  /* config options here */
  reactCompiler: true, // Config lama Anda tetap aman
  
  // TAMBAHKAN INI UNTUK BYPASS CORS/NETWORK ERROR
  async rewrites() {
    return [
      {
        source: '/api/grpc-proxy', // Kita buat 'pintu belakang' di localhost
        destination: 'https://bvigrmajwdfpavxmxefl.supabase.co/functions/v1/recycle-grpc', // Tujuan asli
      },
    ];
  },
};

export default nextConfig;