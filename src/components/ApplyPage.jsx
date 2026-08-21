import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ThemeToggle from './ThemeToggle.jsx';
import Starfield from './Starfield.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const AGE_ERROR = 'You must be at least 18 years old to participate.';
const US_PHONE_PATTERN = /^\([2-9]\d{2}\) [2-9]\d{2}-\d{4}$/;
const DISCORD_USERNAME_PATTERN = /^@(?!.*\.\.)[a-z0-9_.]{2,32}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SCHOOLS_CSV_URL = 'https://raw.githubusercontent.com/MLH/mlh-policies/main/schools.csv';
const ISO_COUNTRY_CODES = 'AF AX AL DZ AS AD AO AI AQ AG AR AM AW AU AT AZ BS BH BD BB BY BE BZ BJ BM BT BO BQ BA BW BV BR IO BN BG BF BI CV KH CM CA KY CF CD CL CN CX CC CO KM CG CK CR CI HR CU CW CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FK FO FJ FI FR GF PF TF GA GM GE DE GH GI GR GL GD GP GU GT GG GN GW GY HT HM VA HN HK HU IS IN ID IR IQ IE IM IL IT JM JP JE JO KZ KE KI KP KR KW KG LA LV LB LS LR LY LI LT LU MO MG MW MY MV ML MT MH MQ MR MU YT MX FM MD MC MN ME MS MA MZ MM NA NR NP NL NC NZ NI NE NG NU NF MK MP NO OM PK PW PS PA PG PY PE PH PN PL PT PR QA RE RO RU RW BL SH KN LC MF PM VC WS SM ST SA SN RS SC SL SG SX SK SI SB SO ZA GS SS ES LK SD SR SJ SE CH SY TW TJ TZ TH TL TG TK TO TT TN TR TM TC TV UG UA AE GB US UM UY UZ VU VE VN VG VI WF EH YE ZM ZW'.split(' ');
const countryNames = new Intl.DisplayNames(['en'], { type: 'region' });
const countryOptions = ISO_COUNTRY_CODES.map((code) => ({ code, name: countryNames.of(code) })).sort((a, b) => a.name.localeCompare(b.name));

const initialForm = {
  first_name: '',
  middle_name: '',
  last_name: '',
  age: '',
  email: '',
  country_of_residence: '',
  discord_username: '',
  phone_number: '',
  university: '',
  classification: '',
  major: '',
  hackathon_participation: '',
  gender: '',
  gender_other: '',
  shirt_size: '',
  shirt_size_other: '',
  pronouns: '',
  pronouns_other: '',
  dietary_notes: '',
  dietary_notes_other: '',
  mlh_code_of_conduct: false,
  mlh_data_authorization: false,
  mlh_marketing_emails: false,
};

function formatUSPhoneNumber(value) {
  let digits = value.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) digits = digits.slice(1);
  digits = digits.slice(0, 10);
  if (digits.length <= 3) return digits ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function formatDiscordUsername(value) {
  const username = value.replace(/^@+/, '').slice(0, 32);
  return username ? `@${username}` : '';
}

function parseSchoolsCsv(csv) {
  return [...csv.matchAll(/"((?:""|[^"])*)"/g)]
    .map((match) => match[1].replace(/""/g, ' ').replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .filter((school) => school !== 'Below is the *' && !school.startsWith('Below is a list of all schools that we\'ve manually verified.'))
    .filter((school, index, schools) => schools.indexOf(school) === index);
}

const dropdownStyles = `
  .application-form__searchable {
    position: relative;
  }

  .application-form__searchable input {
    width: 100%;
  }

  .application-form__dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: var(--color-bg, #1a1a1a);
    border: 1px solid var(--color-border, #333);
    border-top: none;
    max-height: 200px;
    overflow-y: auto;
    z-index: 1000;
  }

  .application-form__dropdown-item {
    padding: 12px 16px;
    cursor: pointer;
    color: white;
    border-bottom: 1px solid var(--color-border, #333);
    transition: background-color 0.15s ease;
  }

  .application-form__dropdown-item:hover {
    background-color: var(--color-primary, #4a7bff);
  }

  .application-form__dropdown-item--selected {
    background-color: var(--color-primary, #4a7bff);
  }
`;

export default function ApplyPage() {
  const [form, setForm] = useState(initialForm);
  const [schools, setSchools] = useState([]);
  const [schoolsStatus, setSchoolsStatus] = useState('loading');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [countrySearch, setCountrySearch] = useState('');
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [universitySearch, setUniversitySearch] = useState('');
  const [universityDropdownOpen, setUniversityDropdownOpen] = useState(false);
  useEffect(() => {
    const styleTag = document.createElement('style');
    styleTag.textContent = dropdownStyles;
    document.head.appendChild(styleTag);
    return () => styleTag.remove();
  }, []);

  useEffect(() => {
    fetch(SCHOOLS_CSV_URL)
      .then((response) => {
        if (!response.ok) throw new Error('Unable to load schools');
        return response.text();
      })
      .then((csv) => {
        setSchools(parseSchoolsCsv(csv));
        setSchoolsStatus('ready');
      })
      .catch(() => setSchoolsStatus('error'));
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      const countryLabel = document.getElementById('country-residence-field');
      const universityLabel = document.getElementById('university-field');
      if (countryLabel && !countryLabel.contains(e.target)) {
        setCountryDropdownOpen(false);
      }
      if (universityLabel && !universityLabel.contains(e.target)) {
        setUniversityDropdownOpen(false);
      }
    }

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setCountryDropdownOpen(false);
        setUniversityDropdownOpen(false);
      }
    }

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  function getFieldError(name, value) {
    const text = String(value ?? '').trim();

    if (['first_name', 'last_name', 'email', 'phone_number'].includes(name) && !text) {
      return 'This field is required.';
    }

    if (name === 'age' && text) {
      if (!/^\d+$/.test(text)) {
        return 'Please enter a valid age.';
      }
      const age = Number(text);
      if (age < 18) return AGE_ERROR;
      if (age > 99) return 'Please enter an age between 18 and 99.';
    }

    if (name === 'email' && text && !EMAIL_PATTERN.test(text)) {
      return 'Please enter a valid email address, such as username@example.com.';
    }
    if (name === 'phone_number' && text && !US_PHONE_PATTERN.test(text)) {
      return 'Please enter 10 phone digits in the format (555) 555-5555.';
    }
    if (name === 'discord_username' && text && !DISCORD_USERNAME_PATTERN.test(text)) {
      return 'Discord usernames must be 2 to 32 characters and can only contain lowercase letters (a to z), numbers (0 to 9), periods, and underscores. Consecutive periods (..) are not allowed. Uppercase letters, spaces, and other symbols are rejected.';
    }
    if (['classification', 'hackathon_participation', 'gender', 'shirt_size'].includes(name) && !text) {
      return 'Please select an option.';
    }
    if (name === 'country_of_residence' && !text) return 'Please select your country of residence.';
    if (name === 'dietary_notes' && !text) return 'Please select your dietary restriction.';
    if (name === 'shirt_size_other' && !text) return 'Please enter your shirt size.';
    if (name === 'gender_other' && !text) return 'Please specify your gender.';
    if (name === 'pronouns_other' && !text) return 'Please specify your pronouns.';
    if (name === 'dietary_notes_other' && !text) return 'Please provide additional dietary information.';
    if (name === 'mlh_code_of_conduct' && !value) return 'You must agree to the MLH Code of Conduct.';
    if (name === 'mlh_data_authorization' && !value) return 'You must authorize application data sharing.';
    return '';
  }

  function validateFields(values) {
    const names = [
      'first_name', 'last_name', 'age', 'email', 'country_of_residence', 'discord_username', 'phone_number',
      'hackathon_participation', 'gender', 'shirt_size', 'dietary_notes',
      'mlh_code_of_conduct', 'mlh_data_authorization',
    ];
    if (values.shirt_size === 'Other') names.push('shirt_size_other');
    if (values.gender === 'Other') names.push('gender_other');
    if (values.pronouns === 'Other') names.push('pronouns_other');
    if (values.dietary_notes === 'Allergies' || values.dietary_notes === 'Other') names.push('dietary_notes_other');
    const nextErrors = Object.fromEntries(
      names.map((name) => [name, getFieldError(name, values[name])]).filter(([, message]) => message),
    );
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function updateField(event) {
    const { name, value } = event.target;
    const nextValue = name === 'age'? value.replace(/\D/g, '').slice(0, 2): name === 'phone_number'? formatUSPhoneNumber(value): name === 'discord_username'? formatDiscordUsername(value): event.target.type === 'checkbox'? event.target.checked: value;
    const nextForm = { ...form, [name]: nextValue };
    if (name === 'shirt_size' && nextValue !== 'Other') nextForm.shirt_size_other = '';
    if (name === 'gender' && nextValue !== 'Other') nextForm.gender_other = '';
    if (name === 'pronouns' && nextValue !== 'Other') nextForm.pronouns_other = '';
    if (name === 'dietary_notes' && nextValue !== 'Allergies' && nextValue !== 'Other') nextForm.dietary_notes_other = '';
    setForm(nextForm);
    
    // For optional fields (classification, major, university), only show error if value is invalid, not if empty
    const optionalFields = ['classification', 'major', 'university'];
    if (optionalFields.includes(name)) {
      // Only validate if there's a value entered (for optional fields)
      if (nextValue) {
        setFieldErrors((current) => ({ ...current, [name]: getFieldError(name, nextValue) }));
      } else {
        // Clear error if field is empty
        setFieldErrors((current) => {
          const { [name]: _, ...rest } = current;
          return rest;
        });
      }
    } else {
      setFieldErrors((current) => ({ ...current, [name]: nextValue ? getFieldError(name, nextValue) : '' }));
    }

    if (name === 'age') {
      const age = Number(nextValue);
      event.target.setCustomValidity(
        nextValue && (age < 18 || age > 99)
          ? (age < 18 ? AGE_ERROR : 'Please enter an age between 18 and 99.')
          : ''
      );
    }
  }

  function handleCountrySearch(e) {
    const value = e.target.value;
    setCountrySearch(value);
    setForm((current) => ({ ...current, country_of_residence: value }));
    setCountryDropdownOpen(true);
  }

  function selectCountry(countryName) {
    setForm({ ...form, country_of_residence: countryName });
    setCountrySearch('');
    setCountryDropdownOpen(false);
    setFieldErrors((current) => ({ ...current, country_of_residence: '' }));
  }

  function handleUniversitySearch(e) {
    const value = e.target.value;
    setUniversitySearch(value);
    setForm((current) => ({ ...current, university: value }));
    setUniversityDropdownOpen(true);
  }

  function selectUniversity(universityName) {
    setForm({ ...form, university: universityName });
    setUniversitySearch('');
    setUniversityDropdownOpen(false);
    setFieldErrors((current) => ({ ...current, university: '' }));
  }

  function openCountryDropdown() {
    setCountrySearch('');
    setCountryDropdownOpen(true);
  }

  function openUniversityDropdown() {
    setUniversitySearch('');
    setUniversityDropdownOpen(true);
  }

  const filteredCountries = countryOptions.filter((country) =>
    country.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const filteredSchools = schools.filter((school) =>
    school.toLowerCase().includes(universitySearch.toLowerCase())
  );

  async function submitApplication(event) {
    event.preventDefault();
    if (!validateFields(form)) return;
    setStatus('submitting');
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const detail = await response.json().catch(() => ({}));
        throw new Error(detail.detail || 'We could not submit your application.');
      }

      window.location.assign('/thank-you');
    } catch (submissionError) {
      setError(submissionError.message);
      setStatus('error');
    }
  }

  return (
    <>
      <Starfield />
      <ThemeToggle />
      <main className="apply-page">
        <div className="container apply-page__container">
          <a href="/" className="apply-page__back">&larr; Back to WolfHacks</a>
          <motion.div
            className="apply-page__intro"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="eyebrow">WOLFHACKS 2026</p>
            <h1 className="section__heading">Apply to build with us.</h1>
            <p className="section__lede">Tell us a little about yourself.</p>
          </motion.div>

          {status === 'submitted' ? (
            <section className="apply-success" aria-live="polite">
              <p className="eyebrow">APPLICATION RECEIVED</p>
              <h2 className="section__heading">You&apos;re on the list.</h2>
              <p className="section__lede">Thanks for applying to WolfHacks. We&apos;ll email you with next steps.</p>
              <a href="/" className="btn btn--primary">Return home</a>
            </section>
          ) : (
            <form className="application-form" onSubmit={submitApplication} noValidate>
              <div className="application-form__grid">
                <label><span className="application-form__question">First Name<sup className="required-marker" aria-hidden="true">*</sup></span><input name="first_name" value={form.first_name} onChange={updateField} required />{fieldErrors.first_name && <span className="application-form__field-error">{fieldErrors.first_name}</span>}</label>
                <label><span className="application-form__question">Middle Name</span><input name="middle_name" value={form.middle_name} onChange={updateField} /></label>
                <label><span className="application-form__question">Last Name<sup className="required-marker" aria-hidden="true">*</sup></span><input name="last_name" value={form.last_name} onChange={updateField} required />{fieldErrors.last_name && <span className="application-form__field-error">{fieldErrors.last_name}</span>}</label>
                
                <label><span className="application-form__question">Age</span><input type="text" name="age" value={form.age} onChange={updateField} inputMode="numeric" pattern="[0-9]*" maxLength="2" placeholder="Enter your age" />{fieldErrors.age && (<span className="application-form__field-error">{fieldErrors.age}</span>)}</label>

                <label><span className="application-form__question">Email<sup className="required-marker" aria-hidden="true">*</sup></span><input type="email" name="email" value={form.email} onChange={updateField} placeholder="username@example.com" required />{fieldErrors.email && <span className="application-form__field-error">{fieldErrors.email}</span>}</label>
                <label id="country-residence-field" className="application-form__searchable"><span className="application-form__question">Country Of Residence<sup className="required-marker" aria-hidden="true">*</sup></span><input type="text" value={countrySearch || form.country_of_residence} onChange={handleCountrySearch} onFocus={openCountryDropdown} placeholder="Search or select your country" required />{countryDropdownOpen && filteredCountries.length > 0 && <div className="application-form__dropdown">{filteredCountries.map(({ code, name }) => <div key={code} onClick={() => selectCountry(name)} className={`application-form__dropdown-item ${form.country_of_residence === name ? 'application-form__dropdown-item--selected' : ''}`}>{name}</div>)}</div>}{fieldErrors.country_of_residence && <span className="application-form__field-error">{fieldErrors.country_of_residence}</span>}</label>
                <label><span className="application-form__question">Discord Username<sup className="required-marker" aria-hidden="true">*</sup></span><input name="discord_username" value={form.discord_username} onChange={updateField} placeholder="@wolfhacker" maxLength="33" required />{fieldErrors.discord_username && <span className="application-form__field-error">{fieldErrors.discord_username}</span>}</label>
                <label><span className="application-form__question">Phone Number<sup className="required-marker" aria-hidden="true">*</sup></span><input type="tel" name="phone_number" value={form.phone_number} onChange={updateField} inputMode="tel" placeholder="(555) 555-5555" maxLength="14" required />{fieldErrors.phone_number && <span className="application-form__field-error">{fieldErrors.phone_number}</span>}</label>
                <label id="university-field" className="application-form__searchable"><span className="application-form__question">University</span><input type="text" value={universitySearch || form.university} onChange={handleUniversitySearch} onFocus={openUniversityDropdown} placeholder={schoolsStatus === 'loading' ? 'Loading schools...' : 'Search or select your university'} disabled={schoolsStatus !== 'ready'} />{universityDropdownOpen && filteredSchools.length > 0 && <div className="application-form__dropdown">{filteredSchools.map((school) => <div key={school} onClick={() => selectUniversity(school)} className={`application-form__dropdown-item ${form.university === school ? 'application-form__dropdown-item--selected' : ''}`}>{school}</div>)}</div>}{schoolsStatus === 'error' && <span className="application-form__field-error">We could not load the school list. Please refresh and try again.</span>}</label>
                <label><span className="application-form__question">Classification</span><select name="classification" value={form.classification} onChange={updateField}><option value="" disabled></option><option>Freshman</option><option>Sophomore</option><option>Junior</option><option>Senior</option><option>Post-Graduate</option><option>Graduated</option></select>{fieldErrors.classification && <span className="application-form__field-error">{fieldErrors.classification}</span>}</label>
                <label><span className="application-form__question">Major</span><input name="major" value={form.major} onChange={updateField} />{fieldErrors.major && <span className="application-form__field-error">{fieldErrors.major}</span>}</label>
                <label><span className="application-form__question">Have You Participated In A Hackathon Before?<sup className="required-marker" aria-hidden="true">*</sup></span><select name="hackathon_participation" value={form.hackathon_participation} onChange={updateField} required><option value="" disabled></option><option>Yes</option><option>No</option></select>{fieldErrors.hackathon_participation && <span className="application-form__field-error">{fieldErrors.hackathon_participation}</span>}</label>
                <label><span className="application-form__question">Gender<sup className="required-marker" aria-hidden="true">*</sup></span><select name="gender" value={form.gender} onChange={updateField} required><option value="" disabled></option><option>Male</option><option>Female</option><option>Other</option></select>{fieldErrors.gender && <span className="application-form__field-error">{fieldErrors.gender}</span>}</label>
                {form.gender === 'Other' && <label><span className="application-form__question">Please Specify Your Gender<sup className="required-marker" aria-hidden="true">*</sup></span><input name="gender_other" value={form.gender_other} onChange={updateField} required />{fieldErrors.gender_other && <span className="application-form__field-error">{fieldErrors.gender_other}</span>}</label>}
                <label><span className="application-form__question">Shirt Size<sup className="required-marker" aria-hidden="true">*</sup></span><select name="shirt_size" value={form.shirt_size} onChange={updateField} required><option value="" disabled></option><option>XS</option><option>S</option><option>M</option><option>L</option><option>XL</option><option>XXL</option><option>XXXL</option><option>Other</option></select>{fieldErrors.shirt_size && <span className="application-form__field-error">{fieldErrors.shirt_size}</span>}</label>
                {form.shirt_size === 'Other' && <label><span className="application-form__question">Please Specify Your Shirt Size<sup className="required-marker" aria-hidden="true">*</sup></span><input name="shirt_size_other" value={form.shirt_size_other} onChange={updateField} required />{fieldErrors.shirt_size_other && <span className="application-form__field-error">{fieldErrors.shirt_size_other}</span>}</label>}
                <label><span className="application-form__question">Pronouns</span><select name="pronouns" value={form.pronouns} onChange={updateField}><option value="" disabled></option><option>He / Him</option><option>She / Her</option><option>They / Them</option><option>Other</option></select></label>
                {form.pronouns === 'Other' && <label><span className="application-form__question">Please Specify Your Pronouns</span><input name="pronouns_other" value={form.pronouns_other} onChange={updateField} />{fieldErrors.pronouns_other && <span className="application-form__field-error">{fieldErrors.pronouns_other}</span>}</label>}
              </div>
              
              <label>
                <span className="application-form__question">Dietary Restrictions<sup className="required-marker" aria-hidden="true">*</sup></span>
                <select name="dietary_notes" value={form.dietary_notes} onChange={updateField} required>
                  <option value="" disabled></option>
                  <option>None</option>
                  <option>Vegetarian</option>
                  <option>Vegan</option>
                  <option>Celiac Disease</option>
                  <option>Allergies</option>
                  <option>Kosher</option>
                  <option>Halal</option>
                  <option>Other</option>
                </select>
                {fieldErrors.dietary_notes && <span className="application-form__field-error">{fieldErrors.dietary_notes}</span>}
              </label>

              {(form.dietary_notes === 'Allergies' || form.dietary_notes === 'Other') && (
                <label>
                  <span className="application-form__question">
                    {form.dietary_notes === 'Allergies'
                      ? 'Please Specify Your Allergies'
                      : 'Please Specify Your Dietary Restriction'}
                    <sup className="required-marker" aria-hidden="true">*</sup>
                  </span>
                  <input
                    type="text"
                    name="dietary_notes_other"
                    value={form.dietary_notes_other}
                    onChange={updateField}
                    placeholder={form.dietary_notes === 'Allergies' ? 'e.g., peanuts, tree nuts, shellfish' : 'Please specify'}
                    required
                  />
                  {fieldErrors.dietary_notes_other && (
                    <span className="application-form__field-error">
                      {fieldErrors.dietary_notes_other}
                    </span>
                  )}
                </label>
              )}
              <div className="application-form__consents">
                <label className="application-form__checkbox">
                  <input type="checkbox" name="mlh_code_of_conduct" checked={form.mlh_code_of_conduct} onChange={updateField} required />
                  <span>I have read and agree to the <a href="https://github.com/MLH/mlh-policies/blob/main/code-of-conduct.md" target="_blank" rel="noreferrer">MLH Code of Conduct</a>.<sup className="required-marker" aria-hidden="true">*</sup></span>
                </label>
                {fieldErrors.mlh_code_of_conduct && <p className="application-form__field-error application-form__consent-error">{fieldErrors.mlh_code_of_conduct}</p>}
                <label className="application-form__checkbox">
                  <input type="checkbox" name="mlh_data_authorization" checked={form.mlh_data_authorization} onChange={updateField} required />
                  <span>I authorize WolfHacks to share my application/registration information with Major League Hacking for event administration, ranking, and administration, including the creation of linked accounts on MLH and <a href="https://dev.to/" target="_blank" rel="noreferrer">DEV</a>, in line with the <a href="https://mlh.io/privacy" target="_blank" rel="noreferrer">MLH Privacy Policy</a>. I further agree to the terms of the <a href="https://github.com/MLH/mlh-policies/blob/main/contest-terms.md" target="_blank" rel="noreferrer">MLH Contest Terms and Conditions</a> and the MLH Privacy Policy.<sup className="required-marker" aria-hidden="true">*</sup></span>
                </label>
                {fieldErrors.mlh_data_authorization && <p className="application-form__field-error application-form__consent-error">{fieldErrors.mlh_data_authorization}</p>}
                <label className="application-form__checkbox">
                  <input type="checkbox" name="mlh_marketing_emails" checked={form.mlh_marketing_emails} onChange={updateField} />
                  <span>I authorize MLH and DEV to send me occasional emails about relevant events, career opportunities, and community announcements.</span>
                </label>
              </div>
              {error && <p className="application-form__error" role="alert">{error}</p>}
              <button className="btn btn--primary" type="submit" disabled={status === 'submitting'}>{status === 'submitting' ? 'Sending...' : 'Submit application'}</button>
            </form>
          )}
        </div>
      </main>
    </>
  );
}