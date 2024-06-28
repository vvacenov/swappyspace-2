import Link from "next/link";

export default function ErrorPage() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 w-full">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-6">Došlo je do greške</h2>
        <p className="mb-4">
          Pokušajte ponovno ili se vratite na početnu stranicu.
        </p>
        <Link className="text-blue-500 hover:underline" href="/">
          Povratak na početnu stranicu
        </Link>
      </div>
    </div>
  );
}
