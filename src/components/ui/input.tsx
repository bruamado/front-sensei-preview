/*
    Exemplo de como usar com type={"options"}:

    <Input
        type="select"
        options={[
            { value: "1", label: "Número 1" },
            { value: "2", label: "Número 2" },
        ]}
        placeHolder="Selecione um número"
        size="normal"
    />

*/

type Props = {
  name?: string | undefined;
  type:
    | "text"
    | "select"
    | "date"
    | "email"
    | "file"
    | "password"
    | "checkbox"
    | "submit";
  placeHolder?: string | undefined;
  label?: string | undefined;
  required?: boolean | undefined;
  size: "tiny" | "small" | "normal" | "fit" | "full";
  defaultValue?: string | undefined;
  options?: {
    value: string;
    label: string;
  }[];
  inputClassName?: string | undefined;
  labelClassName?: string | undefined;
};

const SIZES = {
  tiny: "w-[5rem]",
  small: "w-[8rem]",
  normal: "w-[14rem] sm:w-[19rem]",
  fit: "w-fit",
  full: "w-full",
};

const Input = ({
  name,
  type,
  placeHolder,
  label,
  required,
  size,
  options, // Only for Select type
  defaultValue, // Only for Select type
  inputClassName: outerInputClassName,
  labelClassName: outerLabelClassName,
}: Props) => {
  const inputClassName = `h-8 bg-input placeholder:bg-input placeholder:text-center md:placeholder:text-left mx-1 rounded p-1.5 ${SIZES[size]} ${outerInputClassName}`;

  const labelClassName = `w-full text-center md:w-56 md:min-w-56 p-1 ${
    required &&
    "after:content-['*'] after:text-red-600 after:ml-0.5 after:font-extrabold"
  } ${outerLabelClassName}`;

  if (type === "submit")
    throw new Error(
      "Você deveria usar o componente <Button type='submit' /> no lugar deste Input."
    );

  if (type === "select" && !options)
    throw new Error(
      "A prop 'options' é obrigatória para o type={'select'}.\nConsulte o exemplo no componente para saber como passar essa prop."
    );

  if (type === "select")
    return (
      <div className="flex flex-col my-5 items-center justify-center md:flex-row">
        {label && (
          <label htmlFor={name} className={labelClassName}>
            {label}
          </label>
        )}
        <select
          name={name}
          defaultValue={placeHolder ? "" : defaultValue}
          className={inputClassName}
        >
          {placeHolder && (
            <option value="" disabled hidden>
              {placeHolder}
            </option>
          )}
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );

  return (
    <div className="flex flex-col my-5 items-center justify-center md:flex-row md:justify-start">
      {label && (
        <label htmlFor={name} className={labelClassName}>
          {label}
        </label>
      )}
      <input
        name={name}
        type={type}
        placeholder={placeHolder}
        className={`focus:outline focus:outline-2 focus:outline-winePatternLight ${inputClassName}`}
      />
    </div>
  );
};
export default Input;
