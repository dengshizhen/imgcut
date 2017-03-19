var postFile = { 
        init: function() {
        var t = this;
        t.regional = document.getElementById('label');
        t.getImage = document.getElementById('get_image');
        t.editPic = document.getElementById('edit_pic');
        t.editBox = document.getElementById('cover_box');
        t.px = 0;    //background image x
        t.py = 0;    //background image y
        t.sx = 15;    //crop area x
        t.sy = 15;    //crop area y
        t.sHeight = 100;    //crop area height
        t.sWidth = 100    //crop area width
        //以上的t.px t.py分别表示在实时预览区域的背景图片的坐标；t.sx，t.sy， t.sHeight， t.sWidth分别表示图片的横纵坐标和宽高。
        document.getElementById('post_file').addEventListener("change", t.handleFiles, false);
          //console.log(this.files);
        document.getElementById('save_button').onclick = function() {
            t.editPic.height = t.sHeight;
            t.editPic.width = t.sWidth;
            var ctx = t.editPic.getContext('2d');
            var images = new Image();
            images.src = t.imgUrl;

            images.onload = function(){
                ctx.drawImage(images,t.sx, t.sy, t.sHeight, t.sWidth, 0, 0, t.sHeight, t.sWidth); 
                document.getElementById('show_pic').getElementsByTagName('img')[0].src = t.editPic.toDataURL();
            }

        };
    },

     handleFiles: function() {
        var fileList = this.files[0];
        var oFReader = new FileReader();
        oFReader.readAsDataURL(fileList);
        oFReader.onload = function (oFREvent) { 
            postFile.paintImage(oFREvent.target.result);
           // console.log(oFREvent)
        };
    },
    //上面这几行代码就可以基本实现handleFiles的处理功能，我们在这里就使用了HTML5的File API，首先通过new FileReader()来实例化一个FileReader对象oFReader，再调用其readAsDataURL()方法将文件的内容读取出来并处理成base64编码的格式。

     paintImage: function(url) {
     	//使用canvas绘制图片，不但能使图片自适应居中以及能等比例缩放，并且方便把图片的坐标，尺寸大小传给后来的遮罩层
        var t = this;
        var createCanvas = t.getImage.getContext("2d");
        var img = new Image();
        img.src = url;
        img.onload = function(){

            if ( img.width < t.regional.offsetWidth && img.height < t.regional.offsetHeight) {
                t.imgWidth = img.width;
                t.imgHeight = img.height;

            } else {
                var pWidth = img.width / (img.height / t.regional.offsetHeight);
                var pHeight = img.height / (img.width / t.regional.offsetWidth);
                t.imgWidth = img.width > img.height ? t.regional.offsetWidth : pWidth;
                t.imgHeight = img.height > img.width ? t.regional.offsetHeight : pHeight;
            }
            t.px = (t.regional.offsetWidth - t.imgWidth) / 2 + 'px';
            t.py = (t.regional.offsetHeight - t.imgHeight) / 2 + 'px';

            t.getImage.height = t.imgHeight;
            t.getImage.width = t.imgWidth;
            t.getImage.style.left = t.px;
            t.getImage.style.top = t.py;

            createCanvas.drawImage(img,0,0,t.imgWidth,t.imgHeight);
            t.imgUrl = t.getImage.toDataURL();
            t.cutImage(); 
            t.drag();
        };
    },

    cutImage: function() {
        var t = this;

        t.editBox.height = t.imgHeight;
        t.editBox.width = t.imgWidth;
        t.editBox.style.display = 'block';
        t.editBox.style.left = t.px;
        t.editBox.style.top = t.py;

        var cover = t.editBox.getContext("2d");
        cover.fillStyle = "rgba(0, 0, 0, 0.5)";
        cover.fillRect (0,0, t.imgWidth, t.imgHeight);
        cover.clearRect(t.sx, t.sy, t.sHeight, t.sWidth);


        document.getElementById('show_edit').style.background = 'url(' + t.imgUrl + ')' + -t.sx + 'px ' + -t.sy + 'px no-repeat';
        document.getElementById('show_edit').style.height = t.sHeight + 'px';
        document.getElementById('show_edit').style.width = t.sWidth + 'px';
    },

     drag: function() {
        var t = this;
        var draging = false;
        var startX = 0;
        var startY = 0;

        document.getElementById('cover_box').onmousemove = function(e) {


            var pageX = e.pageX - ( t.regional.offsetLeft + this.offsetLeft );
            var pageY = e.pageY - ( t.regional.offsetTop + this.offsetTop );

            if ( pageX > t.sx && pageX < t.sx + t.sWidth && pageY > t.sy && pageY < t.sy + t.sHeight ) {
                this.style.cursor = 'move';

                this.onmousedown = function(){
                    draging = true;

                    t.ex = t.sx; 
                    t.ey = t.sy;


                    startX = e.pageX - ( t.regional.offsetLeft + this.offsetLeft );
                    startY = e.pageY - ( t.regional.offsetTop + this.offsetTop );

                }
                window.onmouseup = function() {
                    draging = false;
                }

                if (draging) {


                    if ( t.ex + (pageX - startX) < 0 ) {
                        t.sx = 0;
                    } else if ( t.ex + (pageX - startX) + t.sWidth > t.imgWidth) {
                        t.sx = t.imgWidth - t.sWidth;
                    } else {
                        t.sx = t.ex + (pageX - startX);
                    };

                    if (t.ey + (pageY - startY) < 0) {
                        t.sy = 0;
                    } else if ( t.ey + (pageY - startY) + t.sHeight > t.imgHeight ) {
                        t.sy = t.imgHeight - t.sHeight;
                    } else {
                        t.sy = t.ey + (pageY - startY);
                    }

                    t.cutImage();
                }
            } else{
                this.style.cursor = 'auto';
            }
        };
    },
}

postFile.init();