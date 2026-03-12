import { Response, Request } from "express";
import { LOCALIZATION } from "../../assets";
import { LANGUAGE } from "../../constant";

type ILanguage = keyof typeof LANGUAGE;

const makeResponse = async (
  req: Request,
  res: Response,
  statusCode: number,
  success: boolean,
  message: keyof typeof LOCALIZATION.en,
  payload: any = undefined,
  meta: any = {},
) =>
  new Promise<any>((resolve) => {
    const acceptLanguage = req.headers["accept-language"] as ILanguage;
    const allowedLanguages = Object.values(LANGUAGE) as Array<ILanguage>;
    const language =
      acceptLanguage && allowedLanguages.includes(acceptLanguage)
        ? acceptLanguage
        : "en";
    const localizationMessage = LOCALIZATION[language]?.[message] ?? message;

    res.status(statusCode).send({
      success,
      message: localizationMessage || message,
      data: payload ?? null,
      meta,
    });

    resolve(statusCode);
  });

export { makeResponse };
