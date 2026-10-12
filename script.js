'use strict';

const year = document.getElementById('year');
if (year) year.textContent = String(new Date().getFullYear());

const progress = document.getElementById('reading-progress');
const safetyNotice = document.getElementById('principles');
const surveyLink = document.getElementById('survey-link');
const status = document.getElementById('survey-status');

if (progress && safetyNotice && surveyLink && status) {
  const track = progress.querySelector('[role="progressbar"]');
  const road = document.getElementById('journey-road');
  const travelled = progress.querySelector('.journey-travelled');
  const child = document.getElementById('journey-child');
  const roadLength = road.getTotalLength();
  travelled.style.strokeDasharray = String(roadLength);
  const destination = surveyLink.getAttribute('href');
  let unlocked = false;
  let scheduled = false;

  progress.hidden = false;
  surveyLink.removeAttribute('href');
  surveyLink.setAttribute('aria-disabled', 'true');
  surveyLink.setAttribute('role', 'link');
  surveyLink.tabIndex = 0;
  status.textContent = '마지막 안전 안내까지 내려보면 설문에 참여할 수 있습니다.';

  surveyLink.addEventListener('click', (event) => {
    if (!unlocked) event.preventDefault();
  });

  function updateProgress() {
    scheduled = false;
    const scrollTop = Math.max(0, window.scrollY);
    const end = safetyNotice.getBoundingClientRect().bottom + scrollTop;
    // Complete once the bottom of the last explanatory section is visible.
    const requiredScroll = Math.max(0, end - window.innerHeight);
    const fraction = requiredScroll === 0 ? 1 : Math.min(1, scrollTop / requiredScroll);
    const value = fraction >= 1 ? 100 : Math.floor(fraction * 100);
    track.setAttribute('aria-valuenow', String(value));
    travelled.style.strokeDashoffset = String(roadLength * (1 - fraction));
    const position = road.getPointAtLength(roadLength * fraction);
    child.setAttribute('transform', `translate(${position.x} ${position.y})`);
    const currentStage = fraction >= 1 ? 4 : Math.floor(fraction * 3) + 1;
    track.setAttribute('aria-valuetext', `${currentStage}/4단계, 설명 스크롤 ${value}%`);
    progress.classList.toggle('has-arrived', value === 100);

    if (!unlocked && fraction >= 1) {
      unlocked = true;
      surveyLink.setAttribute('href', destination);
      surveyLink.removeAttribute('aria-disabled');
      status.textContent = '설명을 끝까지 살펴보셨습니다. 여러분의 의견을 들려주세요.';
    }
  }

  function scheduleUpdate() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(updateProgress);
  }

  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  window.addEventListener('load', scheduleUpdate);
  window.addEventListener('pageshow', scheduleUpdate);
  document.addEventListener('load', scheduleUpdate, true);
  if (document.fonts) document.fonts.ready.then(scheduleUpdate);
  updateProgress();
}
