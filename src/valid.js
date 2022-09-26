export const dateFormat = 'YYYY-MM-DD HH:mm:ss.SSS'

export function phoneNumber(param) {
  if (/^([0-9]){10}$/.test(param)) {
    return true
  }
  return false
}

export function uuid(param) {
  if (
    /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi.test(
      param,
    )
  ) {
    return true
  }
  return false
}

export function nickName(param) {
  if (/^([a-zA-Z0-9_-]){4,30}$/.test(param)) {
    return true
  }
  return false
}

export function smsCode(param) {
  if (/^([a-zA-Z0-9]){4}$/.test(param)) {
    return true
  }
  return false
}

export function token(param) {
  if (/^([a-zA-Z0-9]){128}$/.test(param)) {
    return true
  }
  return false
}
