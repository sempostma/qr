'use client'

import { useState, useEffect, useMemo } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Mail, MessageSquare, Phone, User, Globe } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

// ... InputField component remains the same ...
const InputField = ({
  id,
  label,
  placeholder,
  type = "text",
  value,
  onChange
}: {
  id: string;
  label: string;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
}) => (
  <div className="space-y-2">
    <Label htmlFor={id}>{label}</Label>
    <Input
      type={type}
      id={id}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
)

interface QRInputsProps {
  onChange: (encodedResult: string) => void
  name: string
}

export default function QRInputs({ name, onChange }: QRInputsProps) {
  const [selectedOption, setSelectedOption] = useState("url")
  const [encodedResult, setEncodedResult] = useState("")

  // ... existing state definitions remain the same ...
  const [url, setUrl] = useState("")
  const [utmParams, setUtmParams] = useState({
    source: "",
    medium: "",
    campaign: "",
    term: "",
    content: ""
  })

  const [contact, setContact] = useState({
    prefix: "",
    lastName: "",
    firstName: "",
    fullName: "",
    title: "",
    organization: "",
    telOther: "",
    telMobile: "",
    fax: "",
    email: "",
    address: ""
  })

  const [plainText, setPlainText] = useState("")

  const [sms, setSms] = useState({
    number: "",
    message: "",
    format: ""
  })

  const [email, setEmail] = useState({
    address: "",
    subject: "",
    body: ""
  })

  const [phoneNumber, setPhoneNumber] = useState("")

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const tabValue = useMemo(() => isOpen ? 'utm' : undefined, [isOpen])

  // Function to generate vCard format
  const generateVCard = () => {
    return `BEGIN:VCARD
VERSION:3.0
N:${contact.lastName};${contact.firstName};;${contact.prefix}
FN:${contact.fullName}
PREFIX:${contact.prefix}
TITLE:${contact.title}
ORG:${contact.organization}
TEL;other:${contact.telOther}
TEL;mobile:${contact.telMobile}
FAX:${contact.fax}
EMAIL:${contact.email}
ADR:;;${contact.address}
END:VCARD`
  }

  // Function to add UTM parameters to URL
  const addUtmParams = (baseUrl: string) => {
    const params = new URLSearchParams()

    if (utmParams.source) params.append('utm_source', utmParams.source)
    if (utmParams.medium) params.append('utm_medium', utmParams.medium)
    if (utmParams.campaign) params.append('utm_campaign', utmParams.campaign)
    if (utmParams.term) params.append('utm_term', utmParams.term)
    if (utmParams.content) params.append('utm_content', utmParams.content)

    const paramsString = params.toString()
    if (!paramsString) return baseUrl

    return baseUrl.includes('?')
      ? `${baseUrl}&${paramsString}`
      : `${baseUrl}?${paramsString}`
  }

  // Function to generate email format
  const generateEmailFormat = () => {
    const subject = encodeURIComponent(email.subject)
    const body = encodeURIComponent(email.body)
    return `mailto:${email.address}?subject=${subject}&body=${body}`
  }

  // Function to update encoded result based on selected option
  const updateEncodedResult = () => {
    switch (selectedOption) {
      case 'url':
        setEncodedResult(addUtmParams(url))
        break
      case 'contact':
        setEncodedResult(generateVCard())
        break
      case 'plaintext':
        setEncodedResult(plainText)
        break
      case 'sms':
        setEncodedResult(`smsto:${sms.number}:${sms.message}`)
        break
      case 'email':
        setEncodedResult(generateEmailFormat())
        break
      case 'phone':
        setEncodedResult(`tel:${phoneNumber}`)
        break
      default:
        setEncodedResult('')
    }
  }

  useEffect(() => {
    onChange(encodedResult)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [encodedResult])

  // Update encoded result whenever form values change
  useEffect(() => {
    updateEncodedResult()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOption, url, contact, plainText, sms, email, phoneNumber])

  // ... existing handler functions remain the same ...
  const handleContactChange = (field: keyof typeof contact) => (value: string) => {
    setContact(prev => ({ ...prev, [field]: value }))
  }

  const handleSmsChange = (field: keyof typeof sms) => (value: string) => {
    setSms(prev => {
      const newState = { ...prev, [field]: value }
      return {
        ...newState,
        format: `smsto:${newState.number}:${newState.message}`
      }
    })
  }

  const handleUtmChange = (field: keyof typeof utmParams) => (value: string) => {
    setUtmParams(prev => ({ ...prev, [field]: value }))
  }

  const handleEmailChange = (field: keyof typeof email) => (value: string) => {
    setEmail(prev => ({ ...prev, [field]: value }))
  }

  const options = [
    { value: "url", label: "URL", icon: Globe },
    { value: "contact", label: "Contact", icon: User },
    { value: "plaintext", label: "Plain Text", icon: MessageSquare },
    { value: "sms", label: "SMS", icon: MessageSquare },
    { value: "email", label: "Email", icon: Mail },
    { value: "phone", label: "Phone", icon: Phone },
  ]

  return (
    <div className="">
      {/* Hidden input for encoded result */}
      <input type="hidden" name={name} value={encodedResult} />

      <RadioGroup
        value={selectedOption}
        onValueChange={setSelectedOption}
        className="grid grid-cols-3 gap-4"
      >
        {/* ... RadioGroup content remains the same ... */}
        {options.map((option) => {
          const Icon = option.icon
          return (
            <div key={option.value}>
              <RadioGroupItem
                value={option.value}
                id={option.value}
                className="peer sr-only"
              />
              <Label
                htmlFor={option.value}
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Icon className="mb-3 h-6 w-6" />
                <span className="text-sm font-medium">{option.label}</span>
              </Label>
            </div>
          )
        })}
      </RadioGroup>

      {/* ... Rest of the form content remains the same ... */}
      {/* URL Section */}
      <div style={{ display: selectedOption === 'url' ? 'block' : 'none' }}>
        <InputField
          id="url"
          label="Enter URL"
          placeholder="https://example.com"
          value={url}
          onChange={setUrl}
        />
        <div className="mt-4">
          <Accordion value={tabValue} type="single">
            <AccordionItem value='utm'>
              <AccordionTrigger onClick={() => setIsOpen(!isOpen)}>Tracking (UTM)</AccordionTrigger>
              <AccordionContent forceMount={true} hidden={!isOpen}>

                <div className="grid grid-cols-2 gap-4">
                  <div className='space-y-2'>
                    <InputField
                      id="utm-source"
                      label="Source*"
                      placeholder="For example: facebook"
                      value={utmParams.source}
                      onChange={handleUtmChange('source')}
                      aria-describedby="utm_source_explain"
                    />
                    <p id="utm_source_explain" className='text-[0.8rem] text-muted-foreground'>Identifies which site sent the traffic, and is a required parameter.	</p>
                  </div>
                  <div className='space-y-2'>

                  <InputField
                    id="utm-medium"
                    label="Medium"
                    placeholder="For example: cpc"
                    value={utmParams.medium}
                    onChange={handleUtmChange('medium')}
                    aria-describedby="utm_medium_explain"
                    />
                    <p id="utm_medium_explain" className='text-[0.8rem] text-muted-foreground'>Identifies what type of link was used, such as email or pay-per-click advertising.	</p>
                    </div>
                  <div className='space-y-2'>

                  <InputField
                    id="utm-campaign"
                    label="Campaign"
                    placeholder="For example: spring_sale"
                    value={utmParams.campaign}
                    onChange={handleUtmChange('campaign')}
                    aria-describedby="utm_campaign_explain"
                  />
                    <p id="utm_campaign_explain" className='text-[0.8rem] text-muted-foreground'>Identifies a specific product promotion or strategic campaign.</p>
                    </div>
                  <div className='space-y-2'>

                  <InputField
                    id="utm-term"
                    label="Term"
                    placeholder="For example: running+shoes"
                    value={utmParams.term}
                    onChange={handleUtmChange('term')}
                    aria-describedby="utm_term_explain"
                  />
                    <p id="utm_term_explain" className='text-[0.8rem] text-muted-foreground'>Identifies search terms.	</p>
                    </div>
                </div>
                <div className="mt-4 space-y-2">
                  
                  <InputField
                    id="utm-content"
                    label="Content"
                    placeholder="For example: logolink"
                    value={utmParams.content}
                    onChange={handleUtmChange('content')}
                    aria-describedby="utm_content_explain"
                  />
                    <p id="utm_content_explain" className='text-[0.8rem] text-muted-foreground'>	Identifies what specifically was clicked to bring the user to the site, such as a banner ad or a text link. It is often used for A/B testing and content-targeted ads.</p>

                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* Contact Section */}
      <div className="space-y-4" style={{ display: selectedOption === 'contact' ? 'block' : 'none' }}>
        <div className="grid grid-cols-2 gap-4">
          <InputField
            id="prefix"
            label="Prefix"
            placeholder="Mr."
            value={contact.prefix}
            onChange={handleContactChange('prefix')}
          />
          <InputField
            id="first-name"
            label="First Name"
            placeholder=""
            value={contact.firstName}
            onChange={handleContactChange('firstName')}
          />
          
        </div>
        <div className="grid grid-cols-2 gap-4">
          <InputField
            id="last-name"
            label="Last Name"
            placeholder=""
            value={contact.lastName}
            onChange={handleContactChange('lastName')}
          />
          <InputField
            id="full-name"
            label="Full Name"
            placeholder=""
            value={contact.fullName}
            onChange={handleContactChange('fullName')}
          />
        </div>
        <InputField
          id="title"
          label="Title"
          placeholder=""
          value={contact.title}
          onChange={handleContactChange('title')}
        />
        <InputField
          id="organization"
          label="Organization"
          placeholder=""
          value={contact.organization}
          onChange={handleContactChange('organization')}
        />
        <div className="grid grid-cols-2 gap-4">
          <InputField
            id="tel-other"
            label="Telephone (Other)"
            placeholder=""
            type="tel"
            value={contact.telOther}
            onChange={handleContactChange('telOther')}
          />
          <InputField
            id="tel-mobile"
            label="Telephone (Mobile)"
            placeholder=""
            type="tel"
            value={contact.telMobile}
            onChange={handleContactChange('telMobile')}
          />
        </div>
        <InputField
          id="fax"
          label="Fax"
          placeholder=""
          type="tel"
          value={contact.fax}
          onChange={handleContactChange('fax')}
        />
        <InputField
          id="email"
          label="Email"
          placeholder="johndoe@example.com"
          type="email"
          value={contact.email}
          onChange={handleContactChange('email')}
        />
        <div className="space-y-2">
          <Label htmlFor="address" className="">Address</Label>
          <Textarea
            id="address"
            placeholder=""
            className="min-h-[100px]"
            value={contact.address}
            onChange={(e) => handleContactChange('address')(e.target.value)}
          />
        </div>
      </div>

      {/* Plain Text Section */}
      <div className="space-y-2" style={{ display: selectedOption === 'plaintext' ? 'block' : 'none' }}>
        <Label htmlFor="plaintext" className="">Enter your text</Label>
        <Textarea
          id="plaintext"
          placeholder="Type your message here..."
          className="min-h-[150px]"
          value={plainText}
          onChange={(e) => setPlainText(e.target.value)}
        />
      </div>

      {/* SMS Section */}
      <div className="space-y-4" style={{ display: selectedOption === 'sms' ? 'block' : 'none' }}>
        <InputField
          id="sms-number"
          label="Recipient's Phone Number"
          placeholder=""
          type="tel"
          value={sms.number}
          onChange={handleSmsChange('number')}
        />
        <div className="space-y-2">
          <Label htmlFor="sms-message" className="">Message Content</Label>
          <Textarea
            id="sms-message"
            placeholder="Hello"
            className="min-h-[100px]"
            value={sms.message}
            onChange={(e) => handleSmsChange('message')(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sms-format" className="">SMS Format</Label>
          <Input
            id="sms-format"
            value={sms.format}
            readOnly
            className="bg-muted"
          />
        </div>
      </div>

      {/* Email Section */}
      <div className="space-y-4" style={{ display: selectedOption === 'email' ? 'block' : 'none' }}>
        <InputField
          id="email-address"
          label="Recipient's Email Address"
          placeholder="john@example.com"
          type="email"
          value={email.address}
          onChange={handleEmailChange('address')}
        />
        <InputField
          id="email-subject"
          label="Email Subject"
          placeholder="Enter the subject of your email"
          value={email.subject}
          onChange={handleEmailChange('subject')}
        />
        <div className="space-y-2">
          <Label htmlFor="email-body">Email Body</Label>
          <Textarea
            id="email-body"
            placeholder="Compose your email message here..."
            className="min-h-[150px]"
            value={email.body}
            onChange={(e) => handleEmailChange('body')(e.target.value)}
          />
        </div>
      </div>

      {/* Phone Section */}
      <div style={{ display: selectedOption === 'phone' ? 'block' : 'none' }}>
        <InputField
          id="phone-number"
          label="Enter Phone Number"
          placeholder="+1 (555) 123-4567"
          type="tel"
          value={phoneNumber}
          onChange={setPhoneNumber}
        />
      </div>
    </div>
  )
}
