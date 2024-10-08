import AuthForm from '@/components/AuthForm';

export default function LoginPage() {
  return (
    <div className="container mx-auto max-w-md mt-10">
      <h1 className="text-2xl font-bold mb-5">Log In</h1>
      <AuthForm mode="login" />
    </div>
  );
}
