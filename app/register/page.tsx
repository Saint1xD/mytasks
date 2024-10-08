import AuthForm from '@/components/AuthForm';

export default function RegisterPage() {
  return (
    <div className="container mx-auto max-w-md mt-10">
      <h1 className="text-2xl font-bold mb-5">Register</h1>
      <AuthForm mode="register" />
    </div>
  );
}
