var express = require("express");
var exe = require("./../connection");
var router = express.Router()

router.get("/",async function(req,res)
{
    second = 1*1000;
    minute = 60*second;
    hour = 60*minute;
    day = 24*hour;
    month = 30*day;
    console.log(month);

    var current_time = new Date().getTime();
    arr = [];
    for(var i=0;i<7;i++)
        {
            var date = new Date(current_time-day*i).toISOString().slice(0,10);
            console.log(date);
            var orders = (await exe(`SELECT COUNT(*) as ttl FROM order_tbl WHERE order_date = '${date}'`))[0].ttl;
            arr.push({
                "date":date,
                "orders":orders
            });
        }
    
    arre = [];
    for(var i=0;i<30;i++)
    {
        var months = new Date(current_time-day*i).toISOString().slice(0,10);
        console.log(months);
        var order = (await exe(`SELECT COUNT(*) as ttll FROM order_tbl WHERE order_date = '${months}'`))[0].ttll;
        arre.push({
            "months":months,
            "order":order
        });
    }
    obj = {"last_week_orders":arr,
            "monthly_orders":arre
    }
    res.render("admin/index.ejs",obj);
});

router.get("/about_company",async function(req,res)
{
    var data = await exe(`SELECT * FROM company`);
    var obj = {"company_info":data[0]};
    res.render("admin/about_company.ejs",obj)
});

router.post("/save_comapny_details",async function(req,res)
{
    var d = req.body;
    var sql = `UPDATE company SET company_name = '${d.company_name}', company_mobile = '${d.company_mobile}', 
    company_email = '${d.company_email}', company_address = '${d.company_address}', instagram_link = '${d.instagram_link}', 
    telegram_link = '${d.telegram_link}', twitter_link = '${d.twitter_link}', whatsapp_no = '${d.whatsapp_no}', 
    youtube_link = '${d.youtube_link}'`;
    var data = await exe(sql);
    // res.send(data);
    res.redirect("/admin/about_company")
});

router.get("/slider",async function(req,res)
{
    var data = await exe("SELECT * FROM slider");
    var obj = {"slides":data};
    res.render("admin/slider.ejs",obj);
});

router.post("/save_slide", async function(req,res)
{
    if(req.files)
        {
            req.body.slide_image = new Date().getTime() + req.files.slide_image.name;
            req.files.slide_image.mv("public/uploads/"+req.body.slide_image);
        }
    var d = req.body;
    var sql = `INSERT  INTO slider (slide_title, slide_details, button_link, button_text, slide_image)
                VALUES ('${d.slide_title}', '${d.slide_details}', '${d.button_link}', '${d.button_text}', '${d.slide_image}')`;
    var data = await exe(sql);
    // res.send(req.body);
    res.redirect("/admin/slider");
});

router.get("/edit_slide/:slider_id",async function(req,res)
{
    var id = req.params.slider_id;
    var sql = `SELECT * FROM slider WHERE slider_id = '${id}'`;
    var data = await exe(sql);
    var obj = {"slider_info":data[0]};
    res.render("admin/edit_slide.ejs",obj);
});

router.post("/update_slide",async function(req,res)
{
    var d = req.body;
    if(req.files.slide_image)
        {
            var slide_image = new Date().getTime()+req.files.slide_image.name;
            req.files.slide_image.mv("public/uploads/"+slide_image);
            var slideimg = `UPDATE slider SET slide_image = '${slide_image}' WHERE slider_id = '${d.slider_id}'`;
            await exe(slideimg) 
        }
    var sql = `UPDATE slider SET
            slide_title = '${d.slide_title}',
            slide_details = '${d.slide_details}',
            button_link = '${d.button_link}',
            button_text = '${d.button_text}'
            WHERE slider_id = '${d.slider_id}'
            `;

            var data = await exe(sql);

        // res.send(data);
        res.redirect("/admin/slider");
});

router.get("/delete_slide/:id",async function(req,res)
{
    var id = req.params.id;
    var sql = `DELETE FROM slider WHERE slider_id = '${id}'`;
    var data = await exe(sql);
    res.redirect("/admin/slider");
});

router.get("/category", async function(req,res)
{
    var data = await exe(`SELECT * FROM category`);
    var obj = {"category":data};
    res.render("admin/category.ejs",obj);
});

router.post("/save_category",async function(req,res)
{
    var d = req.body;
    var sql = `INSERT INTO category (category_name) VALUES ('${d.category_name}')`;
    var data = await exe(sql)
    // res.send(data);
    res.redirect("/admin/category")
});

router.get("/edit_category/:category_id",async function(req,res)
{
    var id = req.params.category_id;
    var sql = `SELECT * FROM category WHERE category_id = '${id}'`;
    var data = await exe(sql);
    var obj = {"category_info":data[0]};
    res.render("admin/edit_category.ejs",obj);
});

router.post("/update_category",async function(req,res)
{
    var d = req.body;

    var sql = `UPDATE category SET
                category_name = '${d.category_name}'
                WHERE category_id = '${d.category_id}'`;
    var data = await exe(sql);
    res.redirect("/admin/category");
})

router.get("/delete_category/:id",async function(req,res)
{
    var id = req.params.id;
    var sql = `DELETE FROM category WHERE category_id = '${id}'`;
    var data = await exe(sql);
    res.redirect("/admin/category");
});

router.get("/add_product",async function(req,res)
{
    var data = await exe(`SELECT * FROM category`);
    var obj = {"cats":data};
    res.render("admin/add_product.ejs",obj);
});

router.post("/save_product",async function(req,res)
{
    if(req.files.product_image1)
        {
            req.body.product_image1 = new Date().getTime()+req.files.product_image1.name;
            req.files.product_image1.mv("public/uploads/"+req.body.product_image1);
        }
    if(req.files.product_image2)
        {
            req.body.product_image2 = new Date().getTime()+req.files.product_image2.name;
            req.files.product_image2.mv("public/uploads/"+req.body.product_image2);
        }
    if(req.files.product_image3)
        {
            req.body.product_image3 = new Date().getTime()+req.files.product_image3.name;
            req.files.product_image3.mv("public/uploads/"+req.body.product_image3);
        }
    else
    {
        req.body.product_image3 = "";
    }
    if(req.files.product_image4)
        {
            req.body.product_image4 = new Date().getTime()+req.files.product_image4.name;
            req.files.product_image4.mv("public/uploads/"+req.body.product_image4);
        }
    else
    {
        req.body.product_image4 = "";
    }
    var d = req.body;
    console.log(req.files);
    var sql = `
        INSERT INTO product (
            category_id,
            product_name,
            product_company,
            product_colors,
            product_label,
            product_details,
            product_image1,
            product_image2,
            product_image3,
            product_image4 
        ) VALUES (
            '${d.category_id}',
            '${d.product_name}',
            '${d.product_company}',
            '${d.product_colors}',
            '${d.product_label}',
            '${d.product_details}',
            '${d.product_image1}',
            '${d.product_image2}',
            '${d.product_image3}',
            '${d.product_image4}'
        )`;

    var data = await exe(sql);
    var product_id = data.insertId;

    for(var i=0;i<d.product_size.length;i++)
        {
            var sql = `
            INSERT INTO product_pricing (product_id, product_size, product_price, product_duplicate_price) 
            VALUE ('${product_id}','${d.product_size[i]}','${d.product_price[i]}','${d.product_duplicate_price[i]}')
            `
        var data = await exe(sql);
        console.log(data);
        }
    
    // res.send(req.body);
    res.redirect("/admin/add_product");
});

router.get("/product_list",async function(req,res)
{
    var sql = `SELECT *,

                (SELECT MIN(product_price) FROM product_pricing WHERE product_pricing.product_id = product.product_id) as min_price,
                (SELECT MAX(product_price) FROM product_pricing WHERE product_pricing.product_id = product.product_id) as max_price

                FROM product`;
    var data = await exe(sql);
    var obj = {"products":data};
    res.render("admin/product_list.ejs",obj);
});

router.get("/view_product/:product_id",async function(req,res)
{
    var id = req.params.product_id;
    var sql = `SELECT * FROM product WHERE product_id = '${id}'`;
    var data = await exe(sql);

    var sql2 = `SELECT * FROM product_pricing WHERE product_id = '${id}'`;
    var pricing = await exe(sql2);

    var obj = {"product_info":data[0],"pricing":pricing};
    res.render("admin/view_product.ejs",obj);
});

router.get("/edit_product/:product_id",async function(req,res)
{
    var id = req.params.product_id;
    var sql = `SELECT * FROM product WHERE product_id = '${id}'`;
    var data = await exe(sql);

    var sql2 = `SELECT * FROM product_pricing WHERE product_id = '${id}'`;
    var pricing = await exe(sql2);

    var obj = {"product_info":data[0],"pricing":pricing};
    res.render("admin/edit_product.ejs",obj);
});

router.post("/update_product",async function(req,res)
{
    var d = req.body;

    if(req.files)
        {
            if(req.files.product_image1)
                {
                    var product_image1 = new Date().getTime()+req.files.product_image1.name;
                    req.files.product_image1.mv("public/uploads/"+product_image1);
                    var imagesql1 = `UPDATE product SET product_image1 = '${product_image1}' WHERE product_id = '${d.product_id}'`;
                    await exe(imagesql1) 
                }

            if(req.files.product_image2)
                {
                    var product_image2 = new Date().getTime()+req.files.product_image2.name;
                    req.files.product_image2.mv("public/uploads/"+product_image2);
                    var imagesql2 = `UPDATE product SET product_image2 = '${product_image2}' WHERE product_id = '${d.product_id}'`;
                    await exe(imagesql2) 
                }

            if(req.files.product_image3)
                {
                    var product_image3 = new Date().getTime()+req.files.product_image3.name;
                    req.files.product_image3.mv("public/uploads/"+product_image3);
                    var imagesql3 = `UPDATE product SET product_image3 = '${product_image3}' WHERE product_id = '${d.product_id}'`; 
                    await exe(imagesql3) 
                }

            if(req.files.product_image4)
                {
                    var product_image4 = new Date().getTime()+req.files.product_image4.name;
                    req.files.product_image4.mv("public/uploads/"+product_image4);
                    var imagesql4 = `UPDATE product SET product_image4 = '${product_image4}' WHERE product_id = '${d.product_id}'`; 
                    await exe(imagesql4) 
                }
        }

    var sql = `UPDATE product SET
            product_name = '${d.product_name}',
            product_company = '${d.product_company}',
            product_colors = '${d.product_colors}',
            product_label = '${d.product_label}',
            product_details = '${d.product_details}' 
            WHERE product_id = '${d.product_id}'
            `;

            var data = await exe(sql);

            for(var i=0;i<d.product_pricing_id.length;i++)
                {
                    var sql = `UPDATE product_pricing SET
                                product_size = '${d.product_size[i]}',
                                product_price = '${d.product_price[i]}',
                                product_duplicate_price = '${d.product_duplicate_price[i]}'
                                WHERE product_pricing_id = '${d.product_pricing_id[i]}'
                                `;
                    var data = await exe(sql); 
                };
        // res.send(req.body);
        res.redirect("/admin/product_list");
});


router.get("/delete_product/:id",async function(req,res)
{
    var id = req.params.id;
    var sql = `DELETE FROM product WHERE product_id = '${id}'`;
    var sql2 = `DELETE FROM product_pricing WHERE product_id = '${id}'`;
    var data = await exe(sql);
    var data2 = await exe(sql2);
    res.redirect("/admin/product_list");
});

router.get("/orders/:status",async function(req,res)
{
    var status = req.params.status;
    var sql = `SELECT * FROM order_tbl WHERE order_status = '${status}'`
    var data = await exe(sql);
    var obj = {"status":status,
                "orders":data};
    res.render("admin/orders.ejs",obj);
});


router.get("/order_details/:order_id", async function(req,res)
{
    var order_id = req.params.order_id;
    var order = await exe(`SELECT * FROM order_tbl WHERE order_id = ${order_id }`);
    var order_products = await exe(`SELECT * FROM order_detail WHERE order_id = ${order_id }`);
    var obj = {"order":order[0],"order_products":order_products}
    res.render("admin/order_details.ejs",obj)   
});

router.get("/transfer_order/:status/:order_id", async function(req,res)
 {
    var status = req.params.status;
    var order_id = req.params.order_id;
    var today = new Date().toISOString().slice(0,10);
    if(status == 'dispatch')
    {
        var sql = `UPDATE 
                    order_tbl 
                    SET 
                    order_status = 'dispatch', 
                    dispatched_date = ${today}
                    WHERE 
                    order_id = ${order_id} `
    }
    else if(status == 'delivered')
    {
        var sql = `UPDATE 
                    order_tbl 
                    SET 
                    order_status = 'delivered', 
                    delivered_date = ${today}
                    WHERE 
                    order_id = ${order_id} ` 
    }
    else if(status == 'cancelled')
    {
        var sql = `UPDATE 
                    order_tbl 
                    SET 
                    order_status = 'cancelled', 
                    cancelled_date = ${today}
                    WHERE 
                    order_id = ${order_id} ` 
    }
    else if(status == 'reject')
    {
        var sql = `UPDATE 
                    order_tbl 
                    SET 
                    order_status = 'reject', 
                    rejected_date = ${today}
                    WHERE 
                    order_id = ${order_id} ` 
    }
    else if(status == 'return')
    {
        var sql = `UPDATE 
                    order_tbl 
                    SET 
                    order_status = 'return', 
                    returned_date = ${today}
                    WHERE 
                    order_id = ${order_id} ` 
    }
    var data = await exe(sql);
    res.redirect("/admin/orders/"+status);  
});


module.exports = router;

// CREATE TABLE company (company_id INT PERIMARY KEY AUTO_INCREMENT, company_name VARCHAR(100), company_mobile VARCHAR(15),
// company_email VARCHAR(100), company_address TEXT, instagram_link TEXT, telegram_link TEXT, twitter_link TEXT, whatsapp_no VARCHAR(15),
// youtube_link TEXT)

//INSERT INTO company(company_name) VALUES ('')

//CREATE TABLE slider (slider_id INT PRIMARY KEY AUTO_INCREMENT, slide_title VARCHAR(50), slide_details TEXT, button_link TEXT, button_text TEXT, slide_image TEXT)

//CREATE TABLE category (category_id INT PRIMARY KEY AUTO_INCREMENT, category_name VARCHAR(100))