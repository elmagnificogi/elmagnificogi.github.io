site_pv = document.getElementById("busuanzi_value_site_pv").innerHTML;
site_uv = document.getElementById("busuanzi_value_site_uv").innerHTML;
site_pv_num = parseInt(site_pv,10) + 1145147;
site_uv_num = parseInt(site_uv,10) + 981462;
document.getElementById("fix_site_pv").innerHTML = site_pv_num;
document.getElementById("fix_site_uv").innerHTML = site_uv_num;