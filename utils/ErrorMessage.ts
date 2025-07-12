export const ERROR_CODES = {
    SUCCESS: 0,
    VALIDATION_ERROR: 1,
    AUTH_ERROR: 2,
    DB_ERROR: 3,
    EMAIL_EXISTS:4,
    SERVER_ERROR: 500,
    FORBIDDEN : 403,
    NOT_FOUND: 404,
} as const;

export const getErrorMessage = (code: number, message?: string) => {
    switch (code) {
        case ERROR_CODES.SUCCESS:
            return message || '성공적으로 처리되었습니다.';
        case ERROR_CODES.VALIDATION_ERROR:
            return message || '입력값을 확인해주세요.';
        case ERROR_CODES.AUTH_ERROR:
            return message || '인증에 실패했습니다.';
        case ERROR_CODES.DB_ERROR:
            return message || '데이터 처리 중 오류가 발생했습니다.';
        case ERROR_CODES.SERVER_ERROR:
            return message || '서버 오류가 발생했습니다.';
        case ERROR_CODES.FORBIDDEN:
            return message || '권한이 없습니다.';
        case ERROR_CODES.EMAIL_EXISTS:
            return message || '이미 가입된 이메일입니다.'
        case ERROR_CODES.NOT_FOUND:
            return message || '찾을 수 없습니다.'
        default:
            return '알 수 없는 오류가 발생했습니다.';
    }
};