'use strict';
(function(window){

    function hexToRgb(hex)
    {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    const pChart = function(element, _color)
    {
        this.canvas = element.get(0);
        this.context = this.canvas.getContext('2d');
        
        this.intervalPaint = undefined;
        this.color = _color || '#7977C2';

        this.columns = [
            'T', 'H'
        ];

        this.data = [
            20, 50
        ];

        this.dataContainer = [

        ];

        this.maxY = 0;
        this.n4Y  = 0;

        this.width  = this.canvas.clientWidth;
        this.height = this.canvas.clientHeight;

        this.canvas.width  = this.width;
        this.canvas.height = this.height;

        let Point = function(_x, _y)
        {
            this.x = _x;
            this.y = _y;
        }

        let Rect = function(_x, _y, _width, _height)
        {
            this.position = new Point(_x, _y);
            this.width = _width;
            this.height = _height;
        }

        let Particle = function(_rect, _color)
        {
            this.isVisible = false;
            this.rect = undefined;

            this.animatePercent = 0;
            this.animateRadius  = 20;

            this.color = _color || {r: 121, g: 119, b: 194};

            this.draw = (context) =>
            {
                let move = new Point(0, 0);
                let oldFillStyle = context.fillStyle;

                if (this.isVisible && this.animatePercent < 100)
                {
                    this.animatePercent += 5;
                    context.fillStyle = `rgba(${ this.color.r }, ${ this.color.g }, ${ this.color.b }, ${ this.animatePercent / 100 })`;

                    move.x = Math.round(Math.random() * (this.animateRadius / 100 * (100 - this.animatePercent))) * (Math.random() * 2 > 1 ? 1 : -1);
                    move.y = Math.round(Math.random() * (this.animateRadius / 100 * (100 - this.animatePercent))) * (Math.random() * 2 > 1 ? 1 : -1);
                }
                else if (!this.isVisible && this.animatePercent > 0)
                {
                    this.animatePercent -= 5;
                    context.fillStyle = `rgba(${ this.color.r }, ${ this.color.g }, ${ this.color.b }, ${ this.animatePercent / 100 })`;

                    move.x = Math.round(Math.random() * (this.animateRadius / 100 * (100 - this.animatePercent))) * (Math.random() * 2 > 1 ? 1 : -1);
                    move.y = Math.round(Math.random() * (this.animateRadius / 100 * (100 - this.animatePercent))) * (Math.random() * 2 > 1 ? 1 : -1);
                }

                context.fillRect(this.rect.position.x + move.x, this.rect.position.y + move.y, this.rect.width, this.rect.height);
                context.fillStyle = oldFillStyle;
                // context.arc(this.rect.position.x, this.rect.position.y, this.rect.width, this.rect.height);
            }

            this.update = (__rect) =>
            {
                this.rect = __rect;
            }

            this.show = (force) =>
            {
                if (force) this.animatePercent = 100;
                this.isVisible = true;
            }
            
            this.remove = (force) =>
            {
                if (force) this.animatePercent = 0;
                this.isVisible = false;
            }

            this.update(_rect);
        }

        let Stick = function(_rect, _color)
        {
            this.isVisible = false;
            this.animatePercent = 0;
            
            this.particles = [];

            this.rect = new Rect(0, 0, 0, 0);
            this.particleSize = 5;
            this.color = _color;

            this.draw = (context) =>
            {
                if (this.isVisible && this.animatePercent < 100)
                {
                    this.animatePercent += 5;

                    this.particles.forEach(x => {
                        x.draw(context);
                    });
                }
                else if (!this.isVisible && this.animatePercent > 0)
                {
                    this.animatePercent -= 5;
                
                    this.particles.forEach(x => {
                        x.draw(context);
                    });
                }
                else if (this.isVisible)
                {
                    context.fillRect(this.rect.position.x, this.rect.position.y, this.rect.width, this.rect.height);
                }
            }

            this.update = (__rect) =>
            {
                if (this.rect.position.x != __rect.position.x
                    || this.rect.position.y != __rect.position.y
                    || this.rect.width != __rect.width
                    || this.rect.height != __rect.height)
                {
                    this.rect = __rect;

                    this.particles.forEach(x => {
                        x.remove();
                    });

                    this.particles = [];

                    let pColor = this.color;

                    for (var y=this.rect.position.y ; y<this.rect.position.y + this.rect.height ; y+=this.particleSize)
                        for (var x=this.rect.position.x ; x<this.rect.position.x + this.rect.width ; x+=this.particleSize)
                            this.particles.push(new Particle(new Rect(x, y, this.particleSize, this.particleSize), this.color));
                }
            }

            this.show = (force) =>
            {
                if (force) this.animatePercent = 100;
                this.isVisible = true;

                this.particles.forEach(x => {
                    x.show(force);
                });
            }

            this.remove = (force) =>
            {
                if (force) this.animatePercent = 0;
                this.isVisible = false;

                this.particles.forEach(x => {
                    x.remove(force);
                });
            }

            this.update(_rect);
        }

        let Container = function(_name, _canvasWidth, _canvasHeight, _colCount, _colIndex, _maxYData, _color)
        {
            this.name    = _name;
            this.stack   = [];
            this.data    = 0;
            this.maxData = 0;
            this.dataY   = 0;
            
            this.marginY = 2;

            this.stickHeight = 10;
            this.stickWidth  = 100;
                
            this.marginX = Math.floor((_canvasWidth - 100) / (_colCount * 2));
            this.marginBottom   = 10;
            this.textAreaBottom = 25;

            this.maxCol = 100;
            this.position = new Point(0, 0);

            this.staticY = _maxYData <= 20 ? _maxYData : Math.round(_canvasHeight / 20);
            this.color = _color || '#7977C2';
            this.pColor = hexToRgb(this.color);

            this.update = (canvasWidth, canvasHeight, colCount, colIndex, maxYData) =>
            {
                let marginLeft     = 35;
                let marginXCount   = 1 + colCount;

                this.maxData = maxYData;

                this.stickWidth  = Math.floor((canvasWidth - marginLeft - this.marginX * marginXCount) / colCount);
                this.position.x  = marginLeft + Math.floor(this.marginX + (this.marginX * colIndex) + (this.stickWidth * colIndex));
                this.position.y  = canvasHeight - this.marginBottom - this.textAreaBottom;
                this.stickHeight = Math.floor((this.position.y - 90) / this.staticY);

                for (var i=1 ; i<=this.staticY ; i++)
                {
                    this.stack.push(new Stick(
                        new Rect(
                            this.position.x,
                            this.position.y - (i * this.stickHeight) - (i * this.marginY),
                            this.stickWidth,
                            this.stickHeight
                        ),
                        this.pColor));
                }
            }

            this.setData = (_data, force) =>
            {
                this.data = _data;
                force = force || false;
                
                // this.remove();
                
                this.dataY = Math.round(_data * this.staticY / this.maxData);

                for (var i=0 ; i<this.staticY ; i++)
                {
                    if (i < this.dataY)
                        this.stack[i].show(force);
                    else {
                        this.stack[i].remove(force);
                    }
                }
            }

            this.draw = (context) =>
            {
                let oldFillStyle = context.fillStyle;

                context.font = "11px Arial";
                var mTextWidth = context.measureText(this.name).width;

                context.fillStyle = `#313131`;
                context.fillText(this.name, this.position.x + (this.stickWidth / 2 - mTextWidth / 2), this.position.y + 22);

                context.fillStyle = `#EAEAEA`;
                context.fillRect(this.position.x + this.stickWidth + this.marginX / 2, this.marginX, 1, this.position.y - this.marginBottom - this.textAreaBottom + 6);

                context.fillStyle = oldFillStyle;

                this.stack.forEach(x => x.draw(context));
            }

            this.remove = () =>
            {
                this.stack.forEach(x => {
                    x.remove();
                });

                this.stack = [];
            }

            this.update(_canvasWidth, _canvasHeight, _colCount, _colIndex, _maxYData);
        }

        
        this.paint = () =>
        {
            this.context.clearRect(0, 0, this.width, this.height);

            this.context.beginPath();

            this.context.font = "11px Arial";
            this.context.fillStyle = `#515151`;

            var n4Height = Math.round(this.height / 4);

            var idx = 0;
            for (var i=0 ; i<this.maxY ; i+=this.n4Y)
            {
                var mTextWidth = this.context.measureText(i).width;
                this.context.fillText(i, 35 - mTextWidth / 2, this.height - n4Height * idx++ - 32);
            }

            this.context.fillStyle = `#DDDDDD`;
            this.context.fillRect(50, 30, 2, this.height - 30 - 35);
            this.context.fillRect(50, this.height - 35, this.width - 50 - 25, 2);

            this.context.fillStyle = this.color;
            this.dataContainer.forEach(x => x.draw(this.context));

            this.context.closePath();
            this.context.fill();

            this.intervalPaint = setTimeout(this.paint, 30);
        }


        this.setColumns = (columns) =>
        {
            this.columns = columns;
        }

        this.setData = (data, force, _maxY) =>
        {
            this.data = data;
            force = force || false;

            this.dataContainer.forEach(x => x.remove());

            this.maxY = _maxY || Math.max.apply(null, data);
            this.n4Y  = Math.round(this.maxY / 4);

            for (var i=0 ; i<data.length ; i++)
            {
                let container = new Container(
                    this.columns[i],
                    this.width,
                    this.height,
                    data.length,
                    i,
                    this.maxY,
                    this.color
                );
                
                container.setData(data[i], force);
                this.dataContainer.push(container);
            }
        }

        this.update = (data, force) =>
        {
            if (this.data.length == data.length)
            {
                this.data = data;
                force = force || false;

                for (var i=0 ; i<data.length ; i++)
                {
                    this.dataContainer[i].setData(data[i], force);
                }
            }
            else
            {
                throw("DATA COL LENGTH NOT MATCHED.");
            }
        }

        this.redraw = () =>
        {
            this.width = this.canvas.clientWidth;
            this.height = this.canvas.clientHeight;

            this.canvas.width  = this.width;
            this.canvas.height = this.height;
        }

        this.play = () =>
        {
            this.intervalPaint = setTimeout(this.paint, 30);
        }
    }

    window.PChart = pChart;

}(window));
