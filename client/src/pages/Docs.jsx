import React from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import Layout from '../components/Layout';

export default function Docs() {
  return (
    <Layout title="Dokumentasi API Interaktif">
      <div className="section-panel rounded-sm p-4 mb-6 text-sm">
        Klik <strong>Authorize</strong> di bawah, isi API Key Anda (dari menu "API Key Saya"), lalu gunakan
        tombol <strong>Try it out</strong> pada setiap endpoint untuk mencoba request langsung tanpa menulis kode.
      </div>
      <div className="bg-white rounded-sm border border-[#E7E2D6] p-2 sm:p-4 overflow-hidden">
        <SwaggerUI url="/api-docs.json" docExpansion="list" />
      </div>
    </Layout>
  );
}
