export const validationRules = {
  username: {
    required: "닉네임을 입력해주세요.",
    minLength: {
      value: 3,
      message: "닉네임은 최소 3자 이상이어야 합니다.",
    },
    maxLength: {
      value: 30,
      message: "닉네임은 최대 30자까지 가능합니다.",
    },
    pattern: {
      value: /^[a-zA-Z0-9가-힣_]+$/,
      message: "닉네임은 한글, 영문, 숫자, 밑줄(_)만 사용할 수 있습니다.",
    },
  },
  petName: {
    required: "반려동물 이름을 입력해주세요.",
    minLength: {
      value: 1,
      message: "반려동물 이름은 최소 1자 이상이어야 합니다.",
    },
    maxLength: {
      value: 30,
      message: "반려동물 이름은 최대 30자까지 가능합니다.",
    },
    pattern: {
      value: /^[a-zA-Z0-9가-힣_]+$/,
      message: "반려동물 이름은 한글, 영문, 숫자, 밑줄(_)만 사용할 수 있습니다.",
    },
  },
  petCategory: {
    required: "반려동물 종류를 선택해주세요.",
    validate: {
      isValidCategory: (value) =>
        ["dog", "cat", "bird", "minipet", "reptile", "other"].includes(value) || "유효한 반려동물 종류를 선택해주세요.",
    },
  },
};
