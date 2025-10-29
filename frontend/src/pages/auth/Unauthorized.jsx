import React from "react";
import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
      <p className="mb-4">You don’t have permission to view this page.</p>
      <Link to="/" className="text-blue-500 underline">Return Home</Link>
    </div>
  );
}
