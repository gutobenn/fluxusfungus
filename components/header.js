import Link from 'next/link'

export default function Header() {
  return (
    <nav className="flex items-center justify-between flex-wrap bg-transparent p-3 flex fixed top-0 inset-x-0 items-center xl:h-full xl:w-1/5 xl:flex-row xl:items-stretch">
      <div className="flex container mx-auto xl:flex-col">
        <div className="flex items-center flex-shrink-0 text-black mr-6 xl:ml-8">
          <span className="font-semibold text-xl text-primary tracking-tight leading-tight font-mono xl:text-7xl xl:mt-20">
            fluxus fungus
          </span>
        </div>
        <div className="w-full block flex-grow flex items-center w-auto xl:flex-col xl:items-start xl:ml-8 xl:mb-20">
          <div className="text-sm flex-grow"></div>
          <div>
            <Link href={`/?page=sobre`} as={'/sobre'} scroll={false}>
              <a className="block mt-0 text-grey-800 ff-font-consolas hover:text-black mr-2">
                sobre
              </a>
            </Link>
          </div>
          <div>
            <Link
              href={`/?page=contaminacoes`}
              as={'/contaminacoes'}
              scroll={false}
            >
              <a className="block mt-0 text-grey-800 ff-font-consolas hover:text-black mr-2">
                contaminações
              </a>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
