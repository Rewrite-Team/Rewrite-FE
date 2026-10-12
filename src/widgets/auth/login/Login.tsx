import type { KakaoLoginTarget } from '@/entities/user';
import { KakaoLoginLink } from '@/features/auth/kakao-login';
import { ROUTES } from '@/shared/constants/routes';
import { TextLogo } from '@/shared/ui/logo';
import { Title } from '@/shared/ui/title';

import { KakaoLoginErrorToast, type KakaoLoginErrorCode } from './KakaoLoginErrorToast';

interface LoginProps {
  kakaoLoginError?: KakaoLoginErrorCode;
  kakaoLoginTarget: KakaoLoginTarget;
}

/** 카카오 로그인 진입점과 서비스 핵심 가치를 안내하는 로그인 화면입니다. */
export function Login({ kakaoLoginError, kakaoLoginTarget }: LoginProps) {
  return (
    <section
      aria-labelledby="login-title"
      className="flex min-h-svh flex-1 items-center justify-center bg-gray-950 px-4 py-6 sm:px-6 sm:py-12"
    >
      <LoginCard kakaoLoginError={kakaoLoginError} kakaoLoginTarget={kakaoLoginTarget} />
    </section>
  );
}

/** 로그인 안내와 카카오 로그인 진입점을 담는 카드입니다. */
function LoginCard({ kakaoLoginError, kakaoLoginTarget }: LoginProps) {
  return (
    <div className="flex w-full max-w-xl flex-col items-center justify-center rounded-3xl border border-gray-800 bg-gray-900 px-6 py-10 sm:px-14 sm:py-13">
      <div className="flex flex-col items-center">
        <TextLogo
          aria-label="Re:write 홈으로 이동"
          className="[&_svg]:h-7 [&_svg]:w-auto"
          href={ROUTES.LANDING}
        />

        <Title
          as="h1"
          className="mt-10 break-keep text-center text-[2.125rem] leading-[1.35] font-semibold tracking-[-0.045em] text-white sm:text-[2.625rem]"
          id="login-title"
        >
          당신의 이야기를
          <br />
          <span className="font-bold text-gray-50">합격에 가까운 문장으로</span>
        </Title>

        <p className="mt-5 max-w-100 break-keep text-center body-16 leading-7 text-gray-100">
          자기소개서 작성부터 AI 첨삭, 면접 준비까지
          <br className="hidden sm:block" /> 한 곳에서 이어가세요.
        </p>
      </div>

      <div className="my-8 flex w-full items-center gap-3.5 body-12 text-gray-300 sm:mt-11">
        <span aria-hidden className="h-px flex-1 bg-gray-700" />
        <span>간편 로그인</span>
        <span aria-hidden className="h-px flex-1 bg-gray-700" />
      </div>

      <KakaoLoginLink target={kakaoLoginTarget} />
      <KakaoLoginErrorToast errorCode={kakaoLoginError} />

      <p className="mt-4 text-center body-12 leading-5 text-gray-300">
        카카오 계정 정보는 간편 로그인에만 사용됩니다.
      </p>
    </div>
  );
}
