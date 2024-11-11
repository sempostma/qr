'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useDebounce } from "@uidotdev/usehooks";
import QRCode, { QRCodeOptions, QRCodeRenderersOptions } from 'qrcode'
import { generateQRCode, State } from './actions'
import { useFormState, useFormStatus } from 'react-dom'
import { FieldValues, useForm, useFormContext, useWatch } from 'react-hook-form'
import { centerImageWithClearArea, QRForm } from '@/lib/qr'
import { z } from 'zod'
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { X } from "lucide-react";
import QRInputs from './inputs'

const initialState: State = {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Generating...' : 'Generate QR Code'}
    </Button>
  )
}

interface FormFieldValuesDebouncedProps {
  onChange: (values: FieldValues) => void
}

const FormFieldValuesDebounced = ({ onChange }: FormFieldValuesDebouncedProps) => {
  useWatch()
  const { getValues } = useFormContext()
  const formFieldsDeps = getValues(['darkColor', 'darkTransparent', 'errorCorrection', 'input', 'lightColor', 'lightTransparent', 'logo', 'margin', 'mask', 'outputType', 'qVersion', 'scale'])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const formValues = useMemo(() => getValues(), formFieldsDeps)
  const debouncedValue = useDebounce(formValues, 300)

  useEffect(() => {
    onChange(debouncedValue)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue])

  return null
}

const FormFieldLogoValues = () => {
  const { getValues } = useFormContext()
  useWatch({ name: 'logo' })
  const logo = getValues('logo')

  return (
    <>
      {!logo
        && (
          <>
            <SelectItem value="L">L (Low)</SelectItem>
            <SelectItem value="M">M (Medium)</SelectItem>
            <SelectItem value="Q">Q (Quartile)</SelectItem>
          </>
        )}
      <SelectItem value="H">H (High)</SelectItem>
    </>
  )
}

export default function QRCodeGenerator() {
  const [state, formAction] = useFormState(generateQRCode, initialState)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const form = useForm<z.infer<typeof QRForm>>({
    resolver: zodResolver(QRForm),
    defaultValues: {
      input: '',
      qVersion: undefined,
      errorCorrection: 'M',
      mask: undefined,
      scale: 8,
      margin: 0,
      lightColor: '#FFFFFF',
      darkColor: '#000000',
      lightTransparent: true,
      darkTransparent: false,
      outputType: 'png',
      logo: undefined
    },
  })

  const [width, setWidth] = useState(0)

  const renderToCanvas = useCallback(async (data: z.infer<typeof QRForm>) => {
    const options: QRCodeOptions = {
      version: data.qVersion,
      errorCorrectionLevel: data.logo ? 'H' : data.errorCorrection,
      maskPattern: data.mask,
    }

    const renderedOpts: QRCodeRenderersOptions = {
      scale: data.scale,
      margin: data.margin,
      color: {
        light: data.lightTransparent ? data.lightColor + '00' : data.lightColor,
        dark: data.darkTransparent ? data.darkColor + '00' : data.darkColor,
      }
    }

    const scale = renderedOpts.scale!
    const margin = renderedOpts.margin!
    const { input, logo } = data

    const canvas = canvasRef.current
    if (!canvas) return

    const qrOptions = { ...options, ...renderedOpts }
    const { modules: { size } } = QRCode.create(input, qrOptions)
    const width = size * renderedOpts.scale!

    canvas.width = width
    canvas.height = width

    setWidth(width)

    if (!input) {
      // clear the canvas
      const ctx = canvas.getContext('2d')!
      ctx.clearRect(0, 0, width, width)
    }

    await new Promise((resolve, reject) => {
      QRCode.toCanvas(canvas, input, qrOptions, function (error) {
        if (error) {
          reject(error)
          return;
        }
        if (logo) {
          const image = new window.Image();
          image.src = window.URL.createObjectURL(logo);

          const ctx = canvas.getContext('2d')!

          image.onload = function () {
            const { imageArea, clearedArea } = centerImageWithClearArea(size, image, 0.4)
            console.log({ imageArea, clearedArea })

            ctx.clearRect(clearedArea.x * scale + margin * scale, clearedArea.y * scale + margin * scale, clearedArea.width * scale, clearedArea.height * scale);
            ctx.drawImage(image, imageArea.x * scale + margin * scale, imageArea.y * scale + margin * scale, imageArea.width * scale, imageArea.height * scale);

            resolve(undefined)
          };

          image.onerror = function (error) {
            reject(error)
          };
        }
        else {
          resolve(undefined)
        }
      });
    })

    return false;
  }, [])

  const downloadToCanvas = useCallback((filename: string) => {
    if (!canvasRef.current) return
    const dataURL = canvasRef.current.toDataURL("image/png");

    // Create a temporary link element
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = filename
    link.click();
  }, [])

  const onSubmit = useCallback(async (data: z.infer<typeof QRForm>) => {
    await renderToCanvas(data)
    downloadToCanvas(`qr-${data.scale}.png`)
  }, [renderToCanvas, downloadToCanvas])

  const [renderError, setRenderError] = useState<string | undefined | Error>()

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const tabValue = useMemo(() => isOpen ? 'advancedOptions' : undefined, [isOpen])

  const hasErrors = state.errors && Object.keys(state.errors).length > 0

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Generate QR Code</CardTitle>
      </CardHeader>
      <CardContent>
        {renderError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>QR Code Error</AlertTitle>
            <AlertDescription>
              {(typeof renderError === 'object' ? renderError.message : typeof renderError === 'string' ? renderError : 'Unknown error during rendering')}
            </AlertDescription>
          </Alert>
        )}
        {hasErrors && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Please correct the following errors:
              <ul className="list-disc list-inside mt-2">
                {Object.entries(state.errors || {}).map(([field, errors]) => (
                  <li key={field}>
                    {field}: {errors.join(', ')}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
        <Form {...form}>
          <form action={formAction} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormFieldValuesDebounced onChange={() => {
              renderToCanvas(form.getValues())
                .then(() => setRenderError(undefined))
                .catch(error => setRenderError(error))
            }} />
            <FormField
              control={form.control}
              name="input"
              render={({ field }) => (
                <QRInputs onChange={field.onChange} name={field.name} />
              )} />

            <div className='flex flex-row gap-4'>
              <FormField
                control={form.control}
                name="darkColor"
                render={({ field }) => (
                  <FormItem className='min-w-40'>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter text or URL" {...field} type="color" />
                    </FormControl>
                    <FormDescription>
                      Hex Code: {field.value}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
              <FormField
                control={form.control}
                name="scale"
                render={({ field }) => (
                  <FormItem className='min-w-40'>
                    <FormLabel>Scale</FormLabel>
                    <FormControl>
                      <Slider
                        min={1}
                        max={40}
                        aria-valuemin={1}
                        aria-valuemax={8}
                        aria-valuenow={field.value}
                        aria-valuetext={`${field.value}`}
                        {...field}
                        onChange={undefined}
                        value={[field.value]}
                        onValueChange={([value]) => field.onChange(+value)}
                      />
                    </FormControl>
                    {width && (
                      <FormDescription>
                        Width {width}px
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )} />
              <FormField
                control={form.control}
                name="margin"
                render={({ field }) => (
                  <FormItem className='min-w-40'>
                    <FormLabel>Margin</FormLabel>
                    <FormControl>
                      <Slider
                        min={0}
                        max={10}
                        step={1}
                        aria-valuemin={0}
                        aria-valuemax={10}
                        aria-valuenow={field.value}
                        aria-valuetext={`Margin ${field.value}`}
                        {...field}
                        value={[field.value]}
                        onChange={undefined}
                        onValueChange={([value]) => field.onChange(value)}
                      />
                    </FormControl>
                    <FormDescription>
                      Current value: {field.value}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />


              <FormField
                control={form.control}
                name="logo"
                render={({ field }) => (
                  <FormItem className='min-w-40'>
                    <FormLabel>Logo</FormLabel>
                    <div className='flex flex-row'>
                      <FormControl>
                        <Input id="qr-logo" type="file" accept='image/*' onChange={e => field.onChange(e.target.files?.[0])} />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          field.onChange(undefined);
                          (document.getElementById('qr-logo') as HTMLInputElement).value = ''
                        }}
                        aria-label="Delete"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormDescription>
                      If you want to add your own logo, make sure to put the Error Correction Level to {"'"}H{"'"} (High).
                    </FormDescription>
                  </FormItem>
                )} />


            </div>

            <Accordion value={tabValue} type="single">
              <AccordionItem value='advancedOptions'>
                <AccordionTrigger onClick={() => setIsOpen(!isOpen)}>Advanced options</AccordionTrigger>
                <AccordionContent forceMount={true} hidden={!isOpen}>
                  <div className='flex flex-row gap-4 items-start'>

                    <FormField
                      control={form.control}
                      name="lightColor"
                      render={({ field }) => (
                        <FormItem className='min-w-40'>
                          <FormLabel>Background Color</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="color"
                            />
                          </FormControl>
                          <FormDescription>
                            Hex Code: {field.value}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )} />
                    <div className='flex flex-col'>

                      <FormField
                        control={form.control}
                        name="lightTransparent"
                        render={({ field }) => (
                          <FormItem className='min-w-40 flex gap-2 items-center'>
                            <FormLabel className='mt-1'>Transparent Background</FormLabel>
                            <FormControl>
                              <Switch
                                name={field.name}
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      <FormField
                        control={form.control}
                        name="darkTransparent"
                        render={({ field }) => (
                          <FormItem className='min-w-40 flex gap-2 items-center'>
                            <FormLabel className='mt-1'>Transparent Foreground</FormLabel>
                            <FormControl>
                              <Switch
                                name={field.name}
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                    </div>

                    <FormField
                      control={form.control}
                      name="outputType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Output Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <input type="hidden" name={field.name} value={field.value} />
                            <FormControl>
                              <SelectTrigger id="type">
                                <SelectValue placeholder="Select output type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="png">PNG</SelectItem>
                              <SelectItem value="svg">SVG</SelectItem>
                              <SelectItem value="utf8">UTF8</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    <FormField
                      control={form.control}
                      name="errorCorrection"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Error Correction Level</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <input type="hidden" name={field.name} value={field.value} />
                            <FormControl>
                              <SelectTrigger id="type">
                                <SelectValue placeholder="Select error correction" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <FormFieldLogoValues />
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />

                  </div>


                </AccordionContent>
              </AccordionItem>
            </Accordion>
            {/* <SubmitButton /> */}
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <div className="w-full flex flex-col items-center justify-center">
          <div>
            <canvas
              key="canvas"
              ref={canvasRef}
              className="border border-gray-300 rounded-lg"
              title='Generated QR Code'
            />
            </div>
          <p className="pb-2 text-sm font-medium text-muted-foreground">Right click the image to save/copy to clipboard.</p>
          {state.message && state.message.startsWith('Failed') && (
            <p className="text-red-500">{state.message}</p>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}