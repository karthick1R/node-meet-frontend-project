import Layout from "../layout/Layout";

export default function SuperAdmin() {
  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-4">Super Admin Dashboard</h1>

      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white p-6 shadow rounded-xl">
          <p className="text-gray-500">Total Users</p>
          <h2 className="text-3xl font-bold">32</h2>
        </div>

        <div className="bg-white p-6 shadow rounded-xl">
          <p className="text-gray-500">Total Rooms</p>
          <h2 className="text-3xl font-bold">12</h2>
        </div>
      </div>
    </Layout>
  );
}
