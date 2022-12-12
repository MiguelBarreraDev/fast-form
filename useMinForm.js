import { toList } from '@/utilities'
import { useEffect, useMemo, useState } from 'react'

/**
 * Parse object to list
 * 
 * @param {object} dict 
 * @returns array
 */
export function toList (dict) {
  return Object.keys(dict).map(e => dict[e])
}

/**
 * Custom hooks that allows you to easily control forms
 * params {Object} defaultValues - default values for the inputs
 */
export default function useMinForm ({ defaultValues = {}, defaultErrors } = {}) {
  const onlyKeys = useMemo(
    () =>
      Object.keys(defaultValues).reduce(
        (obj, key) => ({ ...obj, [key]: '' }),
        {}
      ),
    [defaultValues]
  )
  const [values, setValues] = useState(defaultValues)
  const [errors, setErrors] = useState(onlyKeys)
  const [check, setCheck] = useState(false)
  let functionToValidate = defaultErrors ?? null

  // Error validation on each update of 'errors' state
  useEffect(() => {
    const existingErrors = toList(errors).some((error) => error !== '')
    existingErrors ? setCheck(false) : setCheck(true)
  }, [errors])

  /**
   * Sets attributes for an input element
   * params {String} name - Key to register a input element
   */
  const getAttributes = (name) => {
    const attributes = {
      onChange: (e) => handleChange(name, e),
      name,
      value: values[name] ?? '',
      error: Boolean(errors[name]),
      helperText: errors[name] ?? '',
      onBlur: handleErrors,
      ref: () => {
        if (!errors[name] && errors[name] !== '') {
          setErrors((cs) => ({ ...cs, [name]: '' }))
        }

        if (!values[name] && values[name] !== '') {
          setValues((cs) => ({ ...cs, [name]: '' }))
        }
      }
    }

    return attributes
  }

  /**
   * Reset value inputs to initial values or empty object
   */
  const reset = () => {
    setErrors(onlyKeys)
    setValues(defaultValues || {})
  }

  /**
   * Allowed set function to validate values inputs
   * params {Function} cb - Validate function
   */
  const validate = (cb) => {
    functionToValidate = cb
  }

  /**
   * Detec changes in the inputs and update your values
   * params {String} name - name of the input
   * params {object} e - onChange event
   */
  const handleChange = (name, e) => {
    const { value } = e.target

    setValues((cs) => ({ ...cs, [name]: value }))
  }

  /**
   * Validate all inputs for the onSubmit event
   */
  const validateAllFields = () => {
    if (!functionToValidate) return { send: true }
    const newErrors = functionToValidate(values)
    const existingErrors = Object.keys(errors).some(
      (key) => errors[key] !== newErrors[key]
    )

    return { send: !existingErrors, newErrors }
  }

  /**
   * Update errors in the onBlur event
   * params {object} e - onBlur event
   */
  const handleErrors = (e) => {
    if (!functionToValidate) return

    const { name } = e.target
    const newErrors = functionToValidate(values)

    setErrors((cs) => ({ ...cs, [name]: newErrors[name] }))
  }

  /**
   * HOF for handle onSubmit event
   * params {Function} cb - Function to be executed with the inputs values
   */
  const submit = (cb) => (e) => {
    e.preventDefault()
    const { send, newErrors } = validateAllFields()
    if (!check || !send) return setErrors(newErrors)

    cb(values)
  }

  return {
    getAttributes,
    values,
    errors,
    submit,
    reset,
    validate
  }
}
