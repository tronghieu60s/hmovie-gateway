"use client";

import { Button } from "flowbite-react";
import { Android, Apple, Global, GooglePlay } from "iconsax-react";

export default function Page() {
  return (
    <div className="flex flex-col items-center pt-20">
      <div className="flex flex-col">
        <h1 className="text-4xl font-bold text-gray-900">HMovie TV</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
          HMovie TV là ứng dụng xem phim hỗ trợ đa nền tảng, vui lòng tham khảo
          phía dưới.
        </p>
        <div className="flex flex-col justify-center gap-4 mt-5">
          <div className="flex flex-row flex-wrap gap-2">
            <a href="https://hmovie-tvos.vercel.app/">
              <Button gradientDuoTone="purpleToBlue">
                <Apple size={20} />
                <span className="ml-2">IOS</span>
              </Button>
            </a>
            <a href="https://hmovie-tvos.vercel.app/">
              <Button gradientDuoTone="greenToBlue">
                <Android size={20} />
                <span className="ml-2">Android APK</span>
              </Button>
            </a>
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-bold text-gray-900">Coming Soon</h1>
            <div className="flex flex-row flex-wrap gap-2">
              <Button color="dark" outline>
                <Global size={20} />
                <span className="ml-2">Web TV</span>
              </Button>
              <Button color="dark" outline>
                <GooglePlay size={20} />
                <span className="ml-2">Android Google Play</span>
              </Button>
              <Button color="dark" outline>
                <Android size={20} />
                <span className="ml-2">Android TV APK</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
