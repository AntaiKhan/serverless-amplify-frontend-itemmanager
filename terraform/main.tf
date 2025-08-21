resource "aws_dynamodb_table" "items-table" {
    billing_mode                = "PAY_PER_REQUEST"
    deletion_protection_enabled = false
    hash_key                    = "id"
    name                        = "ItemsTable"
    read_capacity               = 0
    write_capacity              = 0

    attribute {
        name = "id"
        type = "S"
    }

    point_in_time_recovery {
        enabled                 = false
    }

    ttl {
        attribute_name = null
        enabled        = false
    }
}

resource "aws_lambda_function" "items-function" {
    function_name                  = "ItemFunction"
    handler                        = "lambda_function.lambda_handler"
    role                           = "arn:aws:iam::905418329335:role/service-role/ItemFunction-role-dmej1bv4"
    runtime                        = "python3.13"
    timeout                        = 3
    filename                       = "../ItemFunction.zip"
    memory_size                    = 128

    environment {
        variables = {
            "TABLE_NAME" = aws_dynamodb_table.items-table.name
        }
    }

    ephemeral_storage {
        size = 512
    }

    logging_config {
        application_log_level = null
        log_format            = "Text"
        log_group             = "/aws/lambda/ItemFunction"
        system_log_level      = null
    }

    tracing_config {
        mode = "PassThrough"
    }

}

resource "aws_api_gateway_rest_api" "ItemsAPI" {
    name                         = "crud-api"
    policy                       = null
    put_rest_api_mode            = "overwrite"
    api_key_source               = "HEADER"

    endpoint_configuration {
        ip_address_type  = "ipv4"
        types            = [
            "REGIONAL",
        ]
    }
}

resource "aws_api_gateway_deployment" "ItemsDeployment" {
    rest_api_id  = "9lwgudjgw4"
}

resource "aws_api_gateway_stage" "ItemsStage" {
    deployment_id         = "tsuy9m"
    rest_api_id           = "9lwgudjgw4"
    stage_name            = "prod"
}

resource "aws_api_gateway_resource" "ItemsResource" {
    rest_api_id = aws_api_gateway_rest_api.ItemsAPI.id
    parent_id = ""
    path_part = ""
}

resource "aws_api_gateway_resource" "ItemsResource1" {
    rest_api_id = aws_api_gateway_rest_api.ItemsAPI.id
    parent_id = aws_api_gateway_resource.ItemsResource.id
    path_part = "items"
}

resource "aws_api_gateway_resource" "ItemsResource2" {
    rest_api_id = aws_api_gateway_rest_api.ItemsAPI.id
    parent_id = aws_api_gateway_resource.ItemsResource1.id
    path_part = "{id}"  
}

resource "aws_api_gateway_method" "ItemsMethod" {
    authorization        = "NONE"
    http_method          = "POST"
    resource_id          = aws_api_gateway_resource.ItemsResource1.id
    rest_api_id          = aws_api_gateway_rest_api.ItemsAPI.id
}

resource "aws_api_gateway_method" "ItemsGETMethod" {
    authorization        = "NONE"
    http_method          = "GET"
    resource_id          = aws_api_gateway_resource.ItemsResource2.id
    rest_api_id          = aws_api_gateway_rest_api.ItemsAPI.id
    request_parameters   = {
        "method.request.path.id" = true
    }
}

resource "aws_api_gateway_method" "ItemsPUTMethod" {
    authorization        = "NONE"
    http_method          = "PUT"
    resource_id          = aws_api_gateway_resource.ItemsResource2.id
    rest_api_id          = aws_api_gateway_rest_api.ItemsAPI.id
    request_parameters   = {
        "method.request.path.id" = true
    }
}

resource "aws_api_gateway_method" "ItemsDELMethod" {
    authorization        = "NONE"
    http_method          = "DELETE"
    resource_id          = aws_api_gateway_resource.ItemsResource2.id
    rest_api_id          = aws_api_gateway_rest_api.ItemsAPI.id
    request_parameters   = {
        "method.request.path.id" = true
    }
}

resource "aws_amplify_app" "items-app" {
    name                          = "serverless-amplify-frontend-itemmanager"
    platform                      = "WEB"
    repository                    = "https://github.com/AntaiKhan/serverless-amplify-frontend-itemmanager"
    build_spec                    = <<-EOT
        version: 1
        frontend:
          phases:
            preBuild:
              commands:
                - npm ci --cache .npm --prefer-offline
            build:
              commands:
                - npm run build
          artifacts:
            baseDirectory: dist
            files:
              - '**/*'
          cache:
            paths:
              - .npm/**/*
    EOT

    cache_config {
        type = "AMPLIFY_MANAGED_NO_COOKIES"
    }

    custom_rule {
        condition = null
        source    = "/<*>"
        status    = "404-200"
        target    = "/index.html"
    }
}
