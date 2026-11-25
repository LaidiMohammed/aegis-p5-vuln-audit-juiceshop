import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-[#181818] px-4 text-white">
      <p className="caption-2 text-neutral-400">Erreur 404</p>
      <h1 className="heading-3 text-center">Cette page n existe pas</h1>
      <p className="body-3 max-w-[680px] text-center text-neutral-400">Vérifiez l adresse ou revenez à la page d accueil du projet.</p>
      <Link className="button-md rounded-lg bg-white px-3 py-2 text-[#181818]" href="/lab">Revenir à l accueil</Link>
    </main>
  );
}
