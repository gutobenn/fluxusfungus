import Link from 'next/link'

export default function Header() {
  return (
    <nav className="flex items-center justify-between flex-wrap bg-transparent p-3 flex fixed top-0 inset-x-0 items-center">
      <div className="flex container mx-auto">
        <div className="flex items-center flex-shrink-0 text-black mr-6">
          <span className="font-semibold text-xl tracking-tight">
            Fluxus Fungus
          </span>
        </div>
        {/*<div className="block lg:hidden">
          <button
            className="flex items-center px-3 py-2 border rounded text-teal-200 border-teal-400 hover:text-white hover:border-white">
            <svg className="fill-current h-3 w-3" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><title>Menu</title>
              <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"/>
            </svg>
          </button>
        </div>*/}
        <div className="w-full block flex-grow flex items-center w-auto">
          <div className="text-sm flex-grow"></div>
          <div>
            <Link href={`/?page=sobre`} as={'/sobre'} scroll={false}>
              <a className="block mt-0 text-grey-800 hover:text-black mr-2">
                Sobre
              </a>
            </Link>
            {/*<a href="#"
               className="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-teal-500 hover:bg-white mt-4 lg:mt-0">Enviar</a>*/}
          </div>
        </div>
      </div>
    </nav>
  )
}
