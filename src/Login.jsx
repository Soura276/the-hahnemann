import React, { useState, useEffect } from "react";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        window.google.accounts.id.initialize({
          client_id: "994073676019-rdj5ndcq8pkl5k8o2kg2odnh68hkuseo.apps.googleusercontent.com", // <-- Replace with your client ID
          callback: (response) => {
            // You get a JWT credential here
            // You can verify it on the backend or just call onLogin()
            onLogin(response);
          },
        });
        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-btn"),
          { theme: "outline", size: "large", width: 300 }
        );
      }
    };
    return () => {
      document.body.removeChild(script);
    };
  }, [onLogin]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username && password) {
      setError("");
      onLogin();
    } else {
      setError("Please enter both username and password.");
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
      <form
        onSubmit={handleSubmit}
        className="bg-white/90 p-8 rounded-xl shadow-lg flex flex-col gap-4 min-w-[320px]"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Login
        </h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded"
        />
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Login
        </button>
        <div className="text-center text-gray-500 my-2">or</div>
        <div id="google-signin-btn" className="flex justify-center"></div>
      </form>
    </div>
  );
}

export default Login;
