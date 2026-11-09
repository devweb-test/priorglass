/*document.addEventListener('DOMContentLoaded', function(event){


  let arImg = document.querySelectorAll('.img-popup');
  let popop = document.getElementById('priorglass-popup-wrapper');
  let content = document.getElementById('content-box-popup');
  for(let imgItem of arImg){
  	imgItem.addEventListener('click', function(event) {
  		popop.style.display = 'flex';
  		content.innerHTML = '<img src="'+this.src+'" />';
  		event.stopPropagation();
  	});
  };
  let closePopup = document.getElementById('close-popup');
  closePopup.addEventListener('click', function(event) {
  	popop.style.display = 'none';
  })
  popop.addEventListener('click', function(event) {
  	if(event.target.classList.contains('priorglass-popup-wrapper')){
  		popop.style.display = 'none';
  	}
  })

 $('.pr-banner__close').on('click', function() {
	 $('.pr-banner').remove();
	 $('body').removeClass('pr-body_banner');
	 document.cookie = "prbanner=false";
 })

}); */


document.addEventListener('DOMContentLoaded', function() {
    const mainImageBox = document.querySelector('.main_image_box');
    
    if (!mainImageBox) return;

    // Единый экземпляр Fancybox для всей галереи
    let fancyboxInstance = null;
    
    // Основной слайдер
    const mainSwiper = new Swiper('.main_image_box', {
        loop: true,
        spaceBetween: 10,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });
    
    // Обновляем класс current при смене слайда
    mainSwiper.on('slideChange', function () {
        const thumbsSlides = document.querySelectorAll('.images_container .swiper-slide');
        const realIndex = mainSwiper.realIndex;
        
        thumbsSlides.forEach((slide, index) => {
            const img = slide.querySelector('img');
            if (img) {
                img.classList.toggle('current', index === realIndex);
            }
        });
    });
    
    // Обработка клика по миниатюрам
    document.querySelectorAll('.images_container img').forEach((thumb, index) => {
        thumb.addEventListener('click', function() {
            mainSwiper.slideTo(index);
        });
    });
    
    // Подготавливаем данные для галереи один раз
    const galleryItems = Array.from(document.querySelectorAll('.main_image_box .swiper-slide img')).map(img => ({
        src: img.src,
        type: 'image'
    }));
    
    // Обработка клика по основному изображению - открытие Fancybox
    document.querySelectorAll('.main_image_box .swiper-slide img').forEach((img, index) => {
        img.addEventListener('click', function() {
            // Если экземпляр уже существует, просто переходим к нужному слайду
            if (fancyboxInstance) {
                fancyboxInstance.jumpTo(index);
                return;
            }
            
            // Создаем новый экземпляр Fancybox
            fancyboxInstance = Fancybox.show(galleryItems, {
                startIndex: index,
                Navigation: {
                    enabled: true
                },
                Thumbs: {
                    type: 'modern',
                    autoStart: true
                },
                Toolbar: {
                    display: {
                        left: ['infobar'],
                        middle: [],
                        right: ['iterateZoom', 'slideshow', 'fullscreen', 'thumbs', 'close'],
                    },
                },
                on: {
                    close: () => {
                        // Не уничтожаем экземпляр, просто скрываем
                        fancyboxInstance = null;
                    },
                    destroy: () => {
                        fancyboxInstance = null;
                    }
                }
            });
        });
    });
});

