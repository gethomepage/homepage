import { getProviders, signIn } from "next-auth/react";

export default function SignIn({ providers, callbackUrl }) {
  if (!providers || Object.keys(providers).length === 0) {
    return (
      <main className="flex h-screen items-center justify-center">
        <div className="p-6 text-center">
          <h1 className="text-xl font-semibold">Authentication not configured</h1>
          <p className="mt-2 text-sm text-gray-600">OIDC is disabled or missing required environment variables.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-screen items-center justify-center">
      <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-md">
        <h1 className="text-xl font-semibold text-gray-900">Sign in</h1>
        <p className="mt-2 text-sm text-gray-600">Continue with your identity provider.</p>
        <div className="mt-4 space-y-3">
          {Object.values(providers).map((provider) => (
            <button
              key={provider.id}
              type="button"
              onClick={() => signIn(provider.id, { callbackUrl: callbackUrl || "/" })}
              className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Sign in with {provider.name}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}

export async function getServerSideProps(context) {
  const providers = await getProviders();
  const callbackUrl = context?.query?.callbackUrl ?? "/";
  return {
    props: { providers, callbackUrl },
  };
}
