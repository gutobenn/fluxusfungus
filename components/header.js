import Link from 'next/link'
import { CSSTransition } from 'react-transition-group'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function Header() {
  const [isLoaded, setIsLoaded] = useState(false)
  const router = useRouter()
  router.locale = 'en' // force 

  useEffect(() => {
    setIsLoaded(true)
  })

  return (
    <>
      <CSSTransition
        in={isLoaded}
        timeout={900}
        classNames="fluxus-fade-in-600"
      >
        <nav className="flex items-center justify-between flex-wrap bg-transparent p-3 flex fixed top-0 inset-x-0 items-center xl:h-full xl:w-1/5 xl:flex-row xl:items-stretch opacity-0">
          <div className="flex container mx-auto xl:flex-col">
            <div className="flex items-center flex-shrink-0 text-white mr-6 xl:ml-8">
              <span className="font-semibold text-xl text-primary tracking-tight leading-tight font-mono xl:text-7xl xl:mt-20">
                fluxus fungus
              </span>
            </div>
            <div className="w-full block flex-grow flex items-center w-auto xl:flex-col xl:items-start xl:ml-8 xl:mb-20 font-mono text-gray-300">
              <div className="text-sm flex-grow"></div>
              <div>
                {router.locale === 'pt' ? (
                  <Link href={`/?page=sobre`} as={'/sobre'} scroll={false}>
                    <a className="block mt-0 hover:text-white mr-2">sobre</a>
                  </Link>
                ) : (
                  <Link href={`/?page=about`} as={'/about'} scroll={false}>
                    <a className="block mt-0 hover:text-white mr-2">about</a>
                  </Link>
                )}
              </div>
              <div>
                {router.locale === 'pt' ? (
                  <Link
                    href={`/?page=contaminacoes`}
                    as={'/contaminacoes'}
                    scroll={false}
                  >
                    <a className="block mt-0 hover:text-white mr-2">
                      contaminações
                    </a>
                  </Link>
                ) : (
                  <Link
                    href={`/?page=contaminations`}
                    as={'/contaminations'}
                    scroll={false}
                  >
                    <a className="block mt-0 hover:text-white mr-2">
                      contaminations
                    </a>
                  </Link>
                )}
              </div>
              <div className="text-sm ml-5 xl:mt-6 xl:ml-0 fixed bottom-0 right-0 mb-3 mr-4 xl:relative xl:mb-0 xl:mr-0 text-gray-400">
                {router.locale === 'pt' ? (
                  <>
                    [<span className="underline">pt</span>|
                    <Link href={`../en`}>
                      <a className="block mt-0 hover:text-white inline-block">
                        en
                      </a>
                    </Link>
                    ]
                  </>
                ) : (
                  <>
                    [
                    <Link href={`../pt`}>
                      <a className="block mt-0 hover:text-white inline-block">
                        pt
                      </a>
                    </Link>
                    |<span className="underline">en</span>]
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>
      </CSSTransition>
    </>
  )
}
