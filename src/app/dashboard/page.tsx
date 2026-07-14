export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Admin</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Berita</p>
            <h3 className="text-3xl font-bold text-madrasah-900">12</h3>
          </div>
          <div className="w-12 h-12 bg-madrasah-100 text-madrasah-700 rounded-full flex items-center justify-center text-2xl font-bold">
            📰
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Pengunjung Bulan Ini</p>
            <h3 className="text-3xl font-bold text-madrasah-900">1,450</h3>
          </div>
          <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-2xl font-bold">
            👥
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Pembaruan Terakhir</p>
            <h3 className="text-xl font-bold text-madrasah-900 mt-2">Hari ini</h3>
          </div>
          <div className="w-12 h-12 bg-gold-100 text-gold-600 rounded-full flex items-center justify-center text-2xl font-bold">
            ⏱️
          </div>
        </div>
      </div>

      <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Informasi Penting</h2>
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-md">
          <p className="text-sm text-blue-700">
            <strong>Catatan:</strong> Pastikan Anda telah mengonfigurasi kredensial Google Service Account di dalam file <code>.env.local</code> dan membuat Spreadsheet dengan format yang sesuai agar seluruh fitur CMS dapat berjalan dengan baik.
          </p>
        </div>
      </div>
    </div>
  );
}
