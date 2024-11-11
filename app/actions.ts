'use server'

import QRCode, { QRCodeMaskPattern } from 'qrcode'
import { writeFile } from 'fs/promises'
import path from 'path'
import { z } from 'zod'
import { QRForm } from '@/lib/qr'

type FormSchema = z.infer<typeof QRForm>

export type State = {
  errors?: {
    [K in keyof FormSchema]?: string[]
  }
  message?: string
  result?: string
}

export async function generateQRCode(prevState: State, formData: FormData): Promise<State> {
  const { data, success, error } = QRForm.safeParse(Object.fromEntries(formData.entries()))

  if (!success) {
    return {
      errors: error.flatten().fieldErrors,
      message: 'Failed to generate QR code. Please check the form for errors.'
    }
  }

  try {
    const options: QRCode.QRCodeOptions = {
      version: data.qVersion,
      errorCorrectionLevel: data.errorCorrection,
      maskPattern: data.mask,
    }

    const renderedOpts: QRCode.QRCodeRenderersOptions = {
      width: data.width,
      margin: data.margin,
      color: {
        light: data.lightColor,
        dark: data.darkColor,
      }
    }

    const { input, outputType } = data

    let qrCodeData: string | Buffer

    if (outputType === 'utf8') {
      qrCodeData = await QRCode.toString(input, {
        ...options,
        ...renderedOpts,
        type: 'utf8',
      })
    } else if (outputType === 'svg') {
      qrCodeData = await QRCode.toString(input, {
        ...options,
        ...renderedOpts,
        type: 'svg',
      })
    } else {
      qrCodeData = await QRCode.toBuffer(input, {
        ...options,
        ...renderedOpts
      })
    }

    const fileName = `qr-code-${Date.now()}.${outputType}`
    const filePath = path.join(process.cwd(), fileName)

    if (outputType === 'utf8') {
      await writeFile(filePath, qrCodeData as string, 'utf8')
    } else {
      await writeFile(filePath, qrCodeData)
    }

    return { result: `/${fileName}` }
  } catch (error) {
    console.error('Error generating QR code:', error)
    return { message: 'Failed to generate QR code' }
  }
}