import type { AppProps } from "next/app";
import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="bg-gray-300 dark:bg-gray-800 inset-0 absolute h-full w-full overflow-auto">
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <div className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
          <div className="flex flex-wrap items-center justify-around max-w-4xl mt-6 sm:w-full">
            <Component {...pageProps} />
          </div>
        </div>
      </div>
    </div>
  );
}
