import Head from "next/head";

import LoginForm from "../components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div>
      <Head>
        <title>Login - Homepage</title>
      </Head>
      <LoginForm />
    </div>
  );
}