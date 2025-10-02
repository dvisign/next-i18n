import {http, HttpResponse} from "msw";
import {apiEndpoints, handleApiRequest} from "../index";

export default [
  // language
  http.get(
    apiEndpoints(`/api/language/:language`),
    async ({params, request}) => {
      const {language} = params;
      const mockData = {
        ko: {
          start: "src/app/page.js를 편집하여 시작하세요.",
          save: "변경 사항을 즉시 저장하고 확인하세요",
          deploy: "지금 배포",
          docs: "우리 문서를 읽어보세요",
          change: "언어 바꾸기",
          learn: "학습",
          examples: "예제",
          go: "nextJS 바로가기",
        },
        en: {
          start: "Get started by editing src/app/page.js.",
          save: "Save and see your changes instantly",
          deploy: "Deploy now",
          docs: "Read our docs",
          change: "Change Languages",
          learn: "Learn",
          examples: "Examples",
          go: "Go to nextjs.org",
        },
      };

      const status = {status: 200};
      return HttpResponse.json(
        {
          ...mockData,
        }, // body에 JSON 데이터를 설정
        {
          ...status, // 상태 코드
        }
      );
    }
  ),
];
