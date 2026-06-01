"use client"

import * as React from "react"
import { EyeIcon, EyeOffIcon, LockIcon } from "lucide-react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "~/components/ui/input-group"

type PasswordInputProps = Omit<React.ComponentProps<"input">, "type">

export function PasswordInput({
  id,
  autoComplete = "current-password",
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = React.useState(false)

  return (
    <InputGroup>
      <InputGroupAddon align="inline-start">
        <LockIcon aria-hidden />
      </InputGroupAddon>
      <InputGroupInput
        id={id}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        {...props}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          size="icon-sm"
          className="touch-manipulation"
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          onPointerDown={(event) => event.preventDefault()}
          onClick={() => setVisible((value) => !value)}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}
