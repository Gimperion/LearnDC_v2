setwd("U:/LearnDC ETL V2/Graduation Exhibit/Aggregators")

source("U:/R/tomkit.R")

source("./imports/subproc.R")

grads <- sqlQuery(dbrepcard, "SELECT * FROM [dbo].[graduation_w2014_5yr] WHERE [cohort_status] = 1 and [lea_code] not in ('2','3')")


subgroups_list <- c("All","MALE","FEMALE","AM7","AS7","BL7","HI7","MU7","PI7","WH7","SPED","LEP","Economy")




lea_subgroups_df <- data.frame()
for(g in c("Four Year ACGR","Five Year ACGR")){
	for(h in unique(grads$lea_code)){
		.lea_grads <- subset(grads, lea_code == h)

		.type <- g
		.lea_code <- h
		.lea_name <- .lea_grads$lea_name[1]

		for(i in unique(.lea_grads$cohort_year)){
			.grads_year <- subset(.lea_grads, cohort_year == i)

			if(.type == "Four Year ACGR"){
				.year <- i + 4
			}
			else if (.type == "Five Year ACGR"){	
				.year <- i + 5
			}

			for(j in subgroups_list){

				.tmp <- subproc(.grads_year, j)
				.subgroup <- j

				if(.type == "Four Year ACGR"){
					.graduates <- sum(.tmp$graduated, na.rm=TRUE)
				}
				else if (.type == "Five Year ACGR"){	
					.graduates <- sum(.tmp$graduated_5yr, na.rm=TRUE)
					if(.graduates == 0){.graduates <- NA}
				}

				.cohort_size <- nrow(.tmp)

				new_row <- c(.lea_code, .lea_name,.subgroup, .year,.type, .graduates, .cohort_size)
								
				lea_subgroups_df <- rbind(lea_subgroups_df, new_row)
			}
		}
	}
}

colnames(lea_subgroups_df) <- c("lea_code","lea_name","subgroup","year","type","graduates","cohort_size")


sqlSave(dbrepcard_prod, lea_subgroups_df, tablename = "graduation_lea_exhibit_w2014", append = FALSE, rownames=FALSE)