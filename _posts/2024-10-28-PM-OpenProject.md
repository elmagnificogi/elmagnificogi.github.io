---
layout:     post
title:      "部署试用OpenProject"
subtitle:   "PingCode"
date:       2024-10-28
update:     2024-10-28
author:     "elmagnifico"
header-img: "img/z4.jpg"
catalog:    true
tobecontinued: false
tags:
    - 管理
---

## Foreword

部署试用OpenProject，还是发现了一些问题



## 部署

> https://www.openproject.org/docs/installation-and-operations/installation/docker/#all-in-one-container

部署参考官方文档，但是还是有问题

```
docker run -it -p 8080:80 \
  -e OPENPROJECT_SECRET_KEY_BASE=secret \
  -e OPENPROJECT_HOST__NAME=localhost:8080 \
  -e OPENPROJECT_HTTPS=false \
  -e OPENPROJECT_DEFAULT__LANGUAGE=en \
  openproject/openproject:14
```

官方推荐使用docker一键部署，看似简单，其实并不是



- localhost 需要替换成ip地址或者域名，linux这里好多都不识别localhost
- 8080端口不能修改，他的内部puma服务一直监听的是8080端口，换了端口就无法启动
- OPENPROJECT_DEFAULT__LANGUAGE不能修改，如果改个zh或者cn，直接无法启动

这种方式只能体验一下，要正式部署还是修改一下



### 破解

默认OpenProject的看板、规划器都是需要升级企业版才能使用的，这几个功能其实是在本地的，所以破解就是把本地包含的功能给放出来了。下面就是一个大佬22年开始就提供的破解脚本，目前一直都可以使用

> https://gist.github.com/markasoftware/f5b2e55a2c2e3abb1f9eefcdf0bfff45?permalink_comment_id=4216385

```bash
############ REPLACE app/models/enterprise_token.rb in the source code with this file! ################
############ also be sure to RESTART OpenProject after replacing the file.             ################
############ it doesn't show that enterprise mode is enabled in the settings, but all  ################
############ enterprise mode features, such as KanBan boards, are enabled.             ################
#-- copyright
# OpenProject is an open source project management software.
# Copyright (C) 2012-2023 the OpenProject GmbH
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License version 3.
#
# OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
# Copyright (C) 2006-2013 Jean-Philippe Lang
# Copyright (C) 2010-2013 the ChiliProject Team
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# as published by the Free Software Foundation; either version 2
# of the License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
#
# See COPYRIGHT and LICENSE files for more details.
#++
class EnterpriseToken < ApplicationRecord
  class << self
    def current
      RequestStore.fetch(:current_ee_token) do
        set_current_token
      end
    end

    def table_exists?
      connection.data_source_exists? table_name
    end

    def allows_to?(action)
      true
    end

    def active?
      true
    end

    def show_banners?
      false
    end

    def set_current_token
      token = EnterpriseToken.order(Arel.sql('created_at DESC')).first

      if token&.token_object
        token
      end
    end
  end

  validates :encoded_token, presence: true
  validate :valid_token_object
  validate :valid_domain

  before_save :unset_current_token
  before_destroy :unset_current_token

  delegate :will_expire?,
           :subscriber,
           :mail,
           :company,
           :domain,
           :issued_at,
           :starts_at,
           :expires_at,
           :reprieve_days,
           :reprieve_days_left,
           :restrictions,
           to: :token_object

  def token_object
    load_token! unless defined?(@token_object)
    @token_object
  end

  def allows_to?(action)
    true
  end

  def unset_current_token
    # Clear current cache
    RequestStore.delete :current_ee_token
  end

  def expired?(reprieve: true)
    false
  end

  ##
  # The domain is only validated for tokens from version 2.0 onwards.
  def invalid_domain?
    false
  end

  private

  def load_token!
    @token_object = OpenProject::Token.import(encoded_token)
  rescue OpenProject::Token::ImportError => e
    Rails.logger.error "Failed to load EE token: #{e}"
    nil
  end

  def valid_token_object
    errors.add(:encoded_token, :unreadable) unless load_token!
  end

  def valid_domain
    errors.add :domain, :invalid if invalid_domain?
  end
end
```



破解的方法也非常简单：

先停止容器，搜索企业认证的脚本路径

```
find / -name enterprise_token.rb
```

![image-20241028115950242](https://img.elmagnifico.tech/static/upload/elmagnifico/202410281159345.png)

一般会看到这个在docker里的，然后直接vi修改替换成上面的内容即可

重启docker，这个时候企业特性已经可以直接使用了，也不会提示各种购买企业版了



## 试用

仔细试用了一下OpenProject，发现他的逻辑似乎和我想得还是有很大差距。

OpenProject的Scrum的所有操作相当于只能从代办清单中进行，所有迭代的创建也是只能从这里进行

![image-20241028160311380](https://img.elmagnifico.tech/static/upload/elmagnifico/202410281603480.png)

工作包相当于是全局的预览，他能看到各种入口下创建的工作，但是不能反向设置。

也就是说在工作包里创建的任务，是不能反向被代办清单看到的，这逻辑就很奇怪了



同时也发现一个bug，当新建一个故事以后，刷新页面，s2就不显示这个用户故事了

![image-20241028161622676](https://img.elmagnifico.tech/static/upload/elmagnifico/202410281616720.png)

但是进入s2的内部可以看到这个用户故事，对比官方的demo scrum就没有这个问题，检查了所有属性都是一模一样的，这就很奇怪了

![image-20241028161908869](https://img.elmagnifico.tech/static/upload/elmagnifico/202410281619918.png)

OpenProject这样的话，就不是我想要的管理工具了



继续研究，发现可以把官方的作为模板，然后每次从这个模板创建就没有这个问题了

![image-20241028163411521](https://img.elmagnifico.tech/static/upload/elmagnifico/202410281634584.png)

随后发现在工作包类型中将所有都勾选上以后，似乎就正确了，能看到类型中可以正常显示了，但是Task和Milestone等级别的还是不能显示

![image-20241028163555698](https://img.elmagnifico.tech/static/upload/elmagnifico/202410281635739.png)

这里显示这几个类型以后，我大概明白了OpenProject的逻辑：

**代办清单作为Scrum的入口，是不支持普通Task显示的，Scrum的最小规划单位是User story。**

**整个Scrum都无法使用work package中创建的类型（task、milestone、phase）**



## 其他问题

OpenProject项目还是太老了，很多操作都会整个页面更新一下，用惯了响应式的，这种全刷的模式感觉就很奇怪。

无论是本地搭建还是云端，操作的响应速度都不是很快



## Summary

OpenProject，淘汰

如果单纯的只是使用多级规划、甘特图、看板，符合这种功能的面板太多了，OpenProject没有一点优势
