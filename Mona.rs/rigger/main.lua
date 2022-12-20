local imageset = [[j4c]]
--------------------------------------------------------------------------
local fs = require("nativefs")
local gr = love.graphics

local images = love.filesystem.getDirectoryItems(imageset)
table.sort(images, function(a, b) return tonumber(a:match(".*%.")) < tonumber(b:match(".*%.")) end)
local count = #images
if count == 0 then error("no images") end
for k,v in ipairs(images) do
    images[k] = gr.newImage(imageset..'/'..v) or error(imageset..'/'..v)
end

local moving = false
local present = false

local current = 1
local quads = {}
local curquad = 0

local offx, offy = 100, 100
local rigx, rigy, rigw, righ = 0, 0, 50, 30

local positions = {}
local function dump_rig()
    local out = fs.newFile(imageset..".txt") or error ("cant open "..imageset..".txt")
    out:write(require("json").encode(positions))
    out:flush()
    out:close()
end

local msg = ("%d files"):format(count);

function love.draw()
    if msg then
        gr.setColor(1,0,0)
        gr.print(msg, 10, 10)
    end
    local img = images[current]
    local w, h = img:getPixelDimensions()
    gr.setColor(1,1,1)
    gr.rectangle("fill", offx-1, offy-1, w+1+1, h+1+1)
    gr.draw(img, offx, offy)
    if present then
        gr.setColor(1,0,0, .7)
        gr.rectangle("fill", offx+rigx, offy+rigy, rigw, righ)
    end
    gr.setColor(0,1,1, 1)
    gr.rectangle("line", offx+rigx, offy+rigy, rigw, righ)
end

function love.keypressed(k,c,r)
    if k == 's' then
        if #positions == count then
            dump_rig()
        else
            msg = "Not all frames have been rigged"
        end
    elseif k == 'c' then
        msg = nil
    elseif k == 'q' then
        --love.event.quit()
    elseif k == 'a' then
    
    elseif k == 'd' then
    
    elseif k == 'm' then
        moving = not moving
    elseif k == 'p' then
        present = not present
    elseif k == 'left' then
        positions[current] = present and { x = rigx, y = rigy, w = rigw, h = righh }
        if current < 2 then return end
        current = current - 1
        msg = ("%d / %d"):format(current, count)
        position = positions[current]
        present = not not position
        rigx, rigy, rigw, righ = present and position.x or 0, present and position.y or 0, present and position.w or 50, present and position.h or 30
        moving = false
    elseif k == 'right' then
        positions[current] = present and { x = rigx, y = rigy, w = rigw, h = righh }
        if count <= current then return end
        current = current + 1
        msg = ("%d / %d"):format(current, count)
        position = positions[current]
        present = not not position
        rigx, rigy, rigw, righ = present and position.x or 0, present and position.y or 0, present and position.w or 50, present and position.h or 30
        moving = false
    end
end

function love.mousemoved( x, y, dx, dy, istouch )
    if not moving then return end
    rigx, rigy = x - offx, y - offy
end