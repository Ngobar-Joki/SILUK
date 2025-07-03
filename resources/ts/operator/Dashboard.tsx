import React from "react";
import Layout from "../components/layout/Layout";

const Dashboard: React.FC = () => {
    return (
        <Layout>
            <div className="p-4">
                <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
                <p>Welcome to the dashboard!</p>
                {/* Add more dashboard content here */}
            </div>
        </Layout>
    );
};

export default Dashboard;


