import { useState } from 'react'
import { HazardousMaterials } from './components/HazardousMaterials';
import { ContactDetails } from './components/ContactDetails';
import PermitDetails, { ApplicationType } from './components/PermitDetails';
import BusinessDetails from './components/BusinessDetails';
import { NavBar } from './components/NavBar'
import { SubmissionModal, Status as SubmissionStatus } from './components/Modal';
import { useFees } from './helpers/FeeProcessor';
import { useMaterials } from './helpers/MaterialsContext';

export interface ContactDetailsProps {
  prefix: string;
  title: string;
  note?: string;
  required?: boolean;
}

const endpoint = 'https://prod-08.usgovtexas.logic.azure.us:443/workflows/cc81a18f43ca44d38a582cbb2558b91e/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=-aivnhs83y1zB8GXU2C5G28RrHdUtmzo8xP_7brUl10'

function App() {
  const [showModal, setShowModal] = useState(false);
  const [applicationType, setApplicationType] = useState<ApplicationType>('new_permit');
  const { fees, calculateFees } = useFees();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<SubmissionStatus>('error');
  const { materials } = useMaterials();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  }

  const toBase64 = (file: File) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });


  async function processForm(event: React.FormEvent) {
    const form = event.target as HTMLFormElement
    const formData = new FormData(form)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    formData.forEach((_, key) => {
      if (key.startsWith('material_')) {
        formData.delete(key) // Remove all materials from the form data
      }
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: { [key: string]: any } = {}
    formData.forEach((value, key) => {
      data[key] = value
    })
    data.fees = calculateFees(applicationType)

    if (file) {
      data.storage_map = {
        content: await toBase64(file),
        name: file.name
      }
    }

    if (applicationType === 'renewal_no_change') {
      data.materials = []
    } else {
      data.materials = materials
    }
    return data
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const data = await processForm(event)

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (response.ok) {

      setStatus(applicationType === "renewal_no_change" ? 'successCantShowFees' : 'success')
    }

    if (!response.ok) {
      setStatus('error')
      console.error(response)
      console.error(data)
    }

    setShowModal(true);
  }

  return (
    <>
      <NavBar />
      <h1 className="text-center mt-4">Aboveground Hazardous Materials Permit Application</h1>
      <form className="form container mt-4" onSubmit={handleSubmit}>
        <PermitDetails applicationType={applicationType} onApplicationTypeChange={(type) => setApplicationType(type)} />
        <BusinessDetails />
        <ContactDetails
          required
          prefix="primary_contact"
          title="Primary Contact"
          note="This person is responsible for obtaining the initial permit, renewing it every 3 years, and answering application questions. They will be listed as an emergency contact."
        />
        <ContactDetails prefix="responsible_official" title="Responsible Official - Business Owner, Manager, President, etc." />
        <ContactDetails prefix="emergency_contact" title="Emergency Contact - 24 hour contact" />
        <HazardousMaterials show={applicationType !== 'renewal_no_change'} />
        <div className="section mb-4">
          <div className="mb-3">
            <label className={`form-label ${applicationType === 'new_permit' ? "required" : ""}`}>Facilities Storage Map:</label>
            <input type="file" className="form-control" name="storage_map" onChange={handleFileChange} required={applicationType === 'new_permit'} />
          </div>
        </div>
        <button type="submit" className="btn btn-success mb-3">Submit</button>
      </form>
      <SubmissionModal showModal={showModal} setShowModal={setShowModal} status={status} fees={fees} />
    </>
  )
}

export default App