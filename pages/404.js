// eslint-disable-next-line no-unused-vars
import Link from 'next/link'

export default function Custom404() {
  return (
    <div className="h-screen text-center flex flex-col items-center justify-center">
      <h2 className="font-mono">Ops, a conexão micelial se rompeu.</h2>
      <Link href={`/`}>
        <button className="bg-black hover:bg-white text-white hover:text-black py-1 px-6 mt-5 font-mono shadow-md">
          ver fluxus
        </button>
      </Link>
    </div>
  )
}
