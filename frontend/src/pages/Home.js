import React from "react";
import Layout from "../components/Layout";

function Home() {
  return (
    <Layout>
      <div
        style={{
          textAlign: "center",
          marginTop: "80px",
          background: "#fff",
          padding: "60px 30px",
          borderRadius: "12px",
          maxWidth: "800px",
          margin: "80px auto",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}
      >
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: "700",
            color: "#1e293b",
            marginBottom: "15px",
          }}
        >
          🎉 Welcome to EventHub
        </h1>

        <p
          style={{
            color: "#475569",
            fontSize: "17px",
            marginBottom: "25px",
          }}
        >
          Manage your <b>projects</b>, <b>tasks</b>, and <b>team members</b> all in one place.
        </p>

        <button
          onClick={() => (window.location.href = "/dashboard")}
          style={{
            background: "#3b82f6",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            padding: "12px 20px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "500",
          }}
        >
          🚀 Go to Dashboard
        </button>
      </div>
    </Layout>
  );
}

export default Home;