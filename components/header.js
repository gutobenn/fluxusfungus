import Link from 'next/link'
import { CSSTransition } from 'react-transition-group'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function Header() {
  const [isLoaded, setIsLoaded] = useState(false)
  const router = useRouter()

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
            <div className="flex items-center flex-shrink-0 text-black mr-6 xl:ml-8">
              <span className="font-semibold text-xl text-primary tracking-tight leading-tight font-mono xl:text-7xl xl:mt-20">
                fluxus fungus
              </span>
            </div>
            <div className="w-full block flex-grow flex items-center w-auto xl:flex-col xl:items-start xl:ml-8 xl:mb-20 font-mono">
              <div className="text-sm flex-grow"></div>
              <div>
                {router.locale === 'pt' ? (
                  <Link href={`/?page=sobre`} as={'/sobre'} scroll={false}>
                    <a className="block mt-0 text-grey-800 hover:text-black mr-2">
                      sobre
                    </a>
                  </Link>
                ) : (
                  <Link href={`/?page=about`} as={'/about'} scroll={false}>
                    <a className="block mt-0 text-grey-800 hover:text-black mr-2">
                      about
                    </a>
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
                    <a className="block mt-0 text-grey-800 hover:text-black mr-2">
                      contaminações
                    </a>
                  </Link>
                ) : (
                  <Link
                    href={`/?page=contaminations`}
                    as={'/contaminations'}
                    scroll={false}
                  >
                    <a className="block mt-0 text-grey-800 hover:text-black mr-2">
                      contaminations
                    </a>
                  </Link>
                )}
              </div>
              <div className="text-sm ml-5 xl:mt-5 xl:ml-0">
                {router.locale === 'pt' ? (
                  <>
                    [<b>pt</b>|
                    <Link href={`/en`}>
                      <a className="block mt-0 text-grey-800 hover:text-black inline-block">
                        en
                      </a>
                    </Link>
                    ]
                  </>
                ) : (
                  <>
                    [
                    <Link href={`/pt`}>
                      <a className="block mt-0 text-grey-800 hover:text-black inline-block">
                        pt
                      </a>
                    </Link>
                    |<b>en</b>]
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
