setwd("U:/LearnDC ETL V2/Graduation Exhibit/JSON ETL")
source("U:/R/RODBC_Connections.R")
source("U:/R/tomkit.R")
library(jsonlite)


state_grad <- sqlQuery(dbrepcard_prod, "SELECT * FROM [dbo].[graduation_state_exhibit_w2014]")

state_grad <- subset(state_grad, cohort_size >= 10 & !is.na(graduates))


# setwd('U:/LearnDC ETL V2/Export/CSV/state')
# write.csv(state_grad, "Graduation_State.csv", row.names=FALSE)


setwd("U:/LearnDC ETL V2/Export/JSON/state/DC")

key_index <- c(1,2,3)
value_index <- c(4,5)


nested_list <- lapply(1:nrow(state_grad), FUN = function(i){ 
                         list(key = list(state_grad[i,key_index]), 
                         	val = list(state_grad[i,value_index]))
                       })

json <- prettify(toJSON(nested_list, na="null"))

newfile <- file("graduation.json", encoding="UTF-8")
sink(newfile)

cat('{', fill=TRUE)

cat('"timestamp": "',date(),'",', sep="", fill=TRUE)
cat('"org_type": "state",', sep="", fill=TRUE)
cat('"org_name": "District of Columbia",', sep="", fill=TRUE)
cat('"org_code": "dc",', sep="", fill=TRUE)
cat('"exhibit": {', fill=TRUE)
cat('\t"id": "graduation",', fill=TRUE)
cat('\t"data": ',json, fill=TRUE)
cat('\t}', fill=TRUE)
cat('}', fill=TRUE)



sink()
close(newfile)

## VALIDATE JSON
test <- readLines("graduation.json")
validate(test)


