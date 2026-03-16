const allCards = Array.from(document.querySelectorAll('.tinder--card'));
const nope = document.getElementById('nope');
const love = document.getElementById('love');

function activeCards() {
    return allCards.filter((card) => !card.classList.contains('removed'));
}

function getTopCard() {
    return activeCards()[0] || null;
}

function updateCardOrder() {
    const cards = activeCards();
    cards.forEach((card, index) => {
        card.style.zIndex = String(cards.length - index);
    });
}

function resetCards() {
    allCards.forEach((card) => {
        card.classList.remove('removed');
        card.style.display = '';
        card.style.transform = '';
        card.style.zIndex = '';
    });
    updateCardOrder();
}

function removeCard(card, isLove) {
    if (!card || card.classList.contains('removed')) {
        return;
    }

    card.classList.add('removed');
    if (isLove) {
        console.log('Swiped Right: Liked');
    }
    setTimeout(() => {
        card.style.display = 'none';
        updateCardOrder();
        if (activeCards().length === 0) {
            setTimeout(resetCards, 700);
        }
    }, 300);
}

function triggerButtonSwipe(isLove) {
    const card = getTopCard();
    if (!card) {
        return;
    }

    const moveOutWidth = document.body.clientWidth * 1.2;
    const toX = isLove ? moveOutWidth : -moveOutWidth;
    const rotate = isLove ? 25 : -25;
    card.style.transform = `translate(${toX}px, -50px) rotate(${rotate}deg)`;
    removeCard(card, isLove);
}

if (nope) {
    nope.addEventListener('click', () => triggerButtonSwipe(false));
}

if (love) {
    love.addEventListener('click', () => triggerButtonSwipe(true));
}

allCards.forEach((card) => {
    const hammer = new Hammer(card);

    hammer.on('pan', (event) => {
        if (card !== getTopCard()) {
            return;
        }

        card.classList.add('moving');
        if (event.deltaX === 0) {
            return;
        }
        if (event.center.x === 0 && event.center.y === 0) {
            return;
        }

        const xMulti = event.deltaX * 0.03;
        const yMulti = event.deltaY / 80;
        const rotate = xMulti * yMulti;
        card.style.transform = `translate(${event.deltaX}px, ${event.deltaY}px) rotate(${rotate}deg)`;
    });

    hammer.on('panend', (event) => {
        if (card !== getTopCard()) {
            return;
        }

        card.classList.remove('moving');
        const moveOutWidth = document.body.clientWidth;
        const keep = Math.abs(event.deltaX) < 80 || Math.abs(event.velocityX) < 0.5;

        if (keep) {
            card.style.transform = '';
            return;
        }

        const endX = Math.max(Math.abs(event.velocityX) * moveOutWidth, moveOutWidth);
        const toX = event.deltaX > 0 ? endX : -endX;
        const endY = Math.abs(event.velocityY) * moveOutWidth;
        const toY = event.deltaY > 0 ? endY : -endY;
        const xMulti = event.deltaX * 0.03;
        const yMulti = event.deltaY / 80;
        const rotate = xMulti * yMulti;

        card.style.transform = `translate(${toX}px, ${toY + event.deltaY}px) rotate(${rotate}deg)`;
        removeCard(card, event.deltaX > 0);
    });
});

updateCardOrder();