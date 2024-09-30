import os

import click
import pandas as pd
import statsmodels.stats.multitest
import numpy as np
np.float = float
from alphastats import DataSet
from alphastats.loader import GenericLoader,SpectronautLoader,MaxQuantLoader,FragPipeLoader,DIANNLoader
from alphastats.statistics.DifferentialExpressionAnalysis import DifferentialExpressionAnalysis


def load_file(file_path: str, metadata_path: str, engine: str, index: str=None, intensity_column: list[str]=None, evidence_file: str=None):
    if engine == 'spectronaut':
        loader = SpectronautLoader.SpectronautLoader(file=file_path)
        dataset = DataSet(
            loader=loader,
            metadata_path=metadata_path,
            sample_column='Sample',
        )
    elif engine == 'maxquant':
        loader = MaxQuantLoader.MaxQuantLoader(file=file_path, evidence_file=evidence_file)
        dataset = DataSet(
            loader=loader,
            metadata_path=metadata_path,
            sample_column='Sample',
        )

    elif engine == 'fragpipe':
        loader = FragPipeLoader.FragPipeLoader(file=file_path, intensity_column="[sample] Razor Intensity")
        dataset = DataSet(
            loader=loader,
            metadata_path=metadata_path,
            sample_column='Sample',
        )

    elif engine == 'diann':
        loader = DIANNLoader.DIANNLoader(file=file_path)
        dataset = DataSet(
            loader=loader,
            metadata_path=metadata_path,
            sample_column='Sample',
        )

    else:
        loader = GenericLoader.GenericLoader(
            file=file_path,
            intensity_column=intensity_column,
            index_column=index,
            sep='\t'
        )
        dataset = DataSet(
            loader=loader,
            metadata_path=metadata_path,
            sample_column='Sample',
        )
    return dataset

def preprocess_data(dataset: DataSet, impute: str=None, normalize: str=None, log2: bool=True, remove_contaminations: bool=True, data_completeness: float=0.3):
    if impute not in ["mean", "median", "knn", "randomforest", None]:
        raise ValueError(f"Imputation method {impute} not supported.")
    if normalize not in ["zscore", "quantile", "linear", "vst", None]:
        raise ValueError(f"Normalization method {normalize} not supported.")

    dataset.preprocess(
        remove_contaminations=remove_contaminations,
        imputation=impute,
        normalization=normalize,
        log2_transform=log2,
        data_completeness=data_completeness,
    )
    return dataset

def plot_volcano(dataset: DataSet, group_A: list[str], group_B: list[str], p_value: float=0.05, log2_fold_change: float=1.0, column: str="Condition"):
    return dataset.plot_volcano(
        group1=group_A,
        group2=group_B,
        alpha=p_value,
        min_fc=log2_fold_change,
        fdr=0.05,
        column=column
    )

def differential_analysis(dataset: DataSet, group_A: str, group_B: str, p_value: float=0.05, method: str = "ttest", column: str="Condition", permutation: int=10):
    # group should be condition and not sample
    if method in ["wald", "welch-ttest", "ttest", "sam", "paired-ttest"]:
        df = DifferentialExpressionAnalysis(
            dataset=dataset, group1=group_A, group2=group_B, column=column, method=method, perm=permutation, fdr=p_value
        )
        result = df.perform()
        # using multiple testing correction with statsmodels
        _, result["adj.pval.bh"], _, _ = statsmodels.stats.multitest.multipletests(result["pval"], method="fdr_bh", alpha=p_value)
        _, result["adj.pval.bonferroni"], _, _ = statsmodels.stats.multitest.multipletests(result["pval"], method="bonferroni", alpha=p_value)
        result["comparison"] = f"{group_A} vs {group_B}"
        return result

    else:
        raise ValueError(f"Method {method} not supported.")

@click.command()
@click.option('--file_path', required=True, type=str, help='Path to the data file.')
@click.option('--metadata_path', required=True, type=str, help='Path to the metadata file.')
@click.option('--engine', required=True, type=str, help='Engine type (generic, spectronaut, maxquant, fragpipe, diann).')
@click.option('--index', type=str, default=None, help='Index column name.')
@click.option('--intensity_column', type=str, help='Comma-delimited intensity column names.')
@click.option('--impute', type=str, default=None, help='Imputation method (mean, median, knn, randomforest).')
@click.option('--normalize', type=str, default=None, help='Normalization method (zscore, quantile, linear, vst).')
@click.option('--data_completeness', type=float, default=0.3, help='Data completeness threshold.')
@click.option('--group_a', required=False, type=str, help='Group A condition.', default=None)
@click.option('--group_b', required=False, type=str, help='Group B condition.', default=None)
@click.option('--method', type=str, default='ttest', help='Differential analysis method (wald, welch-ttest, ttest, sam, paired-ttest).')
@click.option('--p_value', type=float, default=0.05, help='P-value threshold.')
@click.option('--permutation', type=int, default=10, help='Number of permutations for SAM method.')
@click.option('--output_folder', required=True, type=str, help='Output folder to save results.')
@click.option('--merge_columns', type=str, help='Columns to merge from the original file.', default=None)
@click.option('--evidence_file', type=str, help='Path to the evidence file for MaxQuant.', default=None)
@click.option('--comparison_matrix', type=str, help='Comparison matrix for differential analysis.', default=None)
@click.option('--log2', is_flag=True, help='Flag to signal whether or not to perform log2 transformation.')
def main(file_path, metadata_path, engine, index, intensity_column, impute, normalize, data_completeness, group_a, group_b, method, p_value, permutation, output_folder, merge_columns, evidence_file, comparison_matrix, log2):
    if not comparison_matrix:
        assert group_a and group_b, "Group A and B must be specified."
    if comparison_matrix:
        comparison_matrix = pd.read_csv(comparison_matrix, sep='\t')
    original_data = pd.read_csv(file_path, sep='\t')
    merge_column_list = merge_columns.split(',') if merge_columns else None

    intensity_column_list = intensity_column.split(',') if intensity_column else None

    metadata = pd.read_csv(metadata_path, sep='\t')
    if not intensity_column_list:
        intensity_column_list = metadata['Sample'].tolist()
    dataset = load_file(file_path, metadata_path, engine, index, intensity_column_list, evidence_file)

    dataset = preprocess_data(dataset, impute, normalize, data_completeness=data_completeness, log2=log2)

    preprocessed_file = os.path.join(output_folder, 'preprocessed.txt')
    data = dataset.mat.T
    data.reset_index(inplace=True)
    if merge_column_list:
        data = data.merge(original_data[[index]+merge_column_list], on=index, how='left')
    data.to_csv(preprocessed_file, sep='\t', index=False)
    if isinstance(comparison_matrix, pd.DataFrame):
        results = []
        for ind, row in comparison_matrix.iterrows():
            group_a = row['condition_A']
            group_b = row['condition_B']
            result = differential_analysis(dataset, group_a, group_b, p_value, method, 'Condition', permutation)
            if merge_column_list:
                result = result.merge(original_data[[index]+merge_column_list], on=index, how='left')

            result["comparison"] = row['comparison_label']
            results.append(result)
        result_file = os.path.join(output_folder, 'result.txt')
        pd.concat(results, ignore_index=True).to_csv(result_file, sep='\t', index=False)
    else:
        result = differential_analysis(dataset, group_a, group_b, p_value, method, 'Condition', permutation)
        if merge_column_list:
            result = result.merge(original_data[[index]+merge_column_list], on=index, how='left')

        result_file = os.path.join(output_folder, 'result.txt')
        result.to_csv(result_file, sep='\t', index=False)

if __name__ == '__main__':
    main()