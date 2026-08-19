(() => {
  const rsvpForm = document.querySelector('#rsvp-form');
  const subscribeForm = document.querySelector('#subscribe-form');
  const guestDetails = document.querySelector('#guest-details');

  function getRadioValue(form, name) {
    return form.querySelector(`input[name="${name}"]:checked`)?.value || '';
  }

  function selectedValues(form, name) {
    return [...form.querySelectorAll(`input[name="${name}"]:checked`)].map((el) => el.value);
  }

  function setStatus(el, message, isError = false) {
    el.textContent = message;
    el.classList.toggle('error', isError);
  }

  function updateGuestDetails() {
    const attending = getRadioValue(rsvpForm, 'attending');
    const shouldShow = attending !== 'no';
    guestDetails.hidden = !shouldShow;
    guestDetails.querySelectorAll('input, select').forEach((el) => {
      el.disabled = !shouldShow;
    });
  }

  rsvpForm.querySelectorAll('input[name="attending"]').forEach((radio) => {
    radio.addEventListener('change', updateGuestDetails);
  });

  rsvpForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const status = document.querySelector('#rsvp-status');
    const button = rsvpForm.querySelector('button[type="submit"]');

    if (!rsvpForm.reportValidity()) return;

    const attending = getRadioValue(rsvpForm, 'attending');
    const data = {
      firstName: rsvpForm.elements.firstName.value.trim(),
      lastName: rsvpForm.elements.lastName.value.trim(),
      email: rsvpForm.elements.email.value.trim(),
      attending,
      partySize: attending === 'no' ? 0 : Number(rsvpForm.elements.partySize.value || 1),
      guestNames: attending === 'no' ? '' : rsvpForm.elements.guestNames.value.trim(),
      children: attending === 'no' ? '' : getRadioValue(rsvpForm, 'children'),
      dietaryNotes: attending === 'no' ? '' : rsvpForm.elements.dietaryNotes.value.trim(),
      interests: selectedValues(rsvpForm, 'interests'),
      emailOptIn: rsvpForm.elements.emailOptIn.checked,
      website: rsvpForm.elements.website.value,
      source: 'launch-qr'
    };

    button.disabled = true;
    button.textContent = 'Submitting…';
    setStatus(status, '');

    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(data)
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Unable to submit your RSVP.');

      setStatus(status, attending === 'yes'
        ? 'RSVP received. We look forward to seeing you in the garden.'
        : attending === 'maybe'
          ? 'RSVP received. We’ll keep your response as maybe.'
          : 'RSVP received. Thank you for letting us know.');

      rsvpForm.reset();
      guestDetails.hidden = false;
      guestDetails.querySelectorAll('input, select').forEach((el) => { el.disabled = false; });
      status.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (error) {
      setStatus(status, error.message || 'Something went wrong. Please try again.', true);
    } finally {
      button.disabled = false;
      button.textContent = 'Submit RSVP';
    }
  });

  subscribeForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const status = document.querySelector('#subscribe-status');
    const button = subscribeForm.querySelector('button[type="submit"]');

    if (!subscribeForm.reportValidity()) return;

    button.disabled = true;
    button.textContent = 'Joining…';
    setStatus(status, '');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: subscribeForm.elements.email.value.trim(),
          company: subscribeForm.elements.company.value,
          source: 'launch-site'
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Unable to join the list.');
      subscribeForm.reset();
      setStatus(status, 'You’re on the list.');
    } catch (error) {
      setStatus(status, error.message || 'Something went wrong. Please try again.', true);
    } finally {
      button.disabled = false;
      button.textContent = 'Join the list';
    }
  });
})();
