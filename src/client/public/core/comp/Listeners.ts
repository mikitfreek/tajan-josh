const glob = globalThis

export class Listeners {
    Renderer

    constructor(Renderer) {
        this.Renderer = Renderer
        this.init()
    }

    init() {
        const raise = glob.document.getElementById('raise')
        raise.addEventListener("click", () => {
            this.Renderer.openMd('raise');
        });

        const fire = glob.document.getElementById('fire')
        fire.addEventListener("click", () => {
            this.Renderer.openMd('fire');
        });

        const online = glob.document.getElementById('online')
        online.addEventListener("click", () => {
            console.log('online: ');
        });
    }
}

    // function onButtonClick() {
    //   console.log('click')
    //   // ranks9.forEach(function(e) {
    //   //   var p = document.createElement('option');
    //   //   p.appendChild(document.createTextNode(e));
    //   //   list1.appendChild(p);
    //   // });
    //   // lists.appendChild(list1);
    //   // content.appendChild(lists);
    // }

    // const _buttons = document.querySelectorAll('option'); //getElementsByTagName('option')
    // _buttons.forEach(e => {
    //   e.addEventListener('click', onButtonClick, false);
    // })

    // Set up buttons
    // var buttons = document.getElementsByTagName('button');
    // for (let i = 0; i < buttons.length; i++) {
    //   buttons[i].addEventListener('click', onButtonClick, false);
    // };

    // function onButtonClick(event) {
    //   //console.log(event.target.id);
    //   switch (event.target.id) {
    //     case 'raise':
    //       openMd('raise');
    //       break;
    //     case 'fire':
    //       openMd('fire');
    //       break;
    //     case 'menu':
    //       break;
    //     case 'online':
    //       console.log('online: ' );
    //       break;
    //   }
    // }
